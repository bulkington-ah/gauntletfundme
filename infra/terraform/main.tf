data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  resource_prefix = "${var.app_name}-${var.environment}"
  default_tags = {
    Application = var.app_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  merged_tags = merge(local.default_tags, var.tags)
  apprunner_runtime_environment_variables = {
    DATABASE_URL             = local.database_url
    HOSTNAME                 = "0.0.0.0"
    PORT                     = tostring(var.app_port)
    OPENAI_DIGEST_MODEL      = var.openai_digest_model
    OPENAI_DIGEST_TIMEOUT_MS = tostring(var.openai_digest_timeout_ms)
  }
  apprunner_runtime_environment_secrets = trimspace(var.openai_api_key_secret_arn) == "" ? {} : {
    OPENAI_API_KEY = trimspace(var.openai_api_key_secret_arn)
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-vpc"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-igw"
  })
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr_blocks[0]
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-public-a"
  })
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr_blocks[1]
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-public-b"
  })
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr_blocks[0]
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-private-a"
  })
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr_blocks[1]
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-private-b"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-public-rt"
  })
}

resource "aws_route" "public_internet_access" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-nat"
  })
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-nat"
  })

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-private-rt"
  })
}

resource "aws_route" "private_internet_access" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main.id
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}

resource "aws_security_group" "apprunner_vpc_connector" {
  name        = "${local.resource_prefix}-apprunner-vpc-connector"
  description = "Security group for App Runner VPC connector egress."
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-apprunner-vpc-connector-sg"
  })
}

resource "aws_security_group" "rds" {
  name        = "${local.resource_prefix}-rds"
  description = "Security group for private PostgreSQL access from App Runner."
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.apprunner_vpc_connector.id]
    description     = "PostgreSQL from App Runner VPC connector"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr_block]
  }

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-rds-sg"
  })
}

resource "aws_db_subnet_group" "main" {
  name = "${local.resource_prefix}-db-subnet-group"
  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-db-subnet-group"
  })
}

resource "random_password" "database" {
  length  = 32
  special = false
}

resource "aws_db_instance" "postgres" {
  identifier                 = "${local.resource_prefix}-postgres"
  db_name                    = var.database_name
  username                   = var.database_username
  password                   = random_password.database.result
  engine                     = "postgres"
  engine_version             = var.database_engine_version
  instance_class             = var.database_instance_class
  allocated_storage          = var.database_allocated_storage
  max_allocated_storage      = var.database_max_allocated_storage
  storage_encrypted          = true
  multi_az                   = var.database_multi_az
  backup_retention_period    = var.database_backup_retention_days
  auto_minor_version_upgrade = true
  apply_immediately          = true
  skip_final_snapshot        = true
  deletion_protection        = var.database_deletion_protection
  publicly_accessible        = false
  db_subnet_group_name       = aws_db_subnet_group.main.name
  vpc_security_group_ids     = [aws_security_group.rds.id]

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-postgres"
  })
}

locals {
  database_url = format(
    "postgres://%s:%s@%s:%d/%s",
    var.database_username,
    random_password.database.result,
    aws_db_instance.postgres.address,
    aws_db_instance.postgres.port,
    var.database_name
  )
}

resource "aws_ecr_repository" "app" {
  name                 = local.resource_prefix
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(local.merged_tags, {
    Name = "${local.resource_prefix}-ecr"
  })
}

resource "aws_iam_role" "apprunner_ecr_access" {
  name = "${local.resource_prefix}-apprunner-ecr-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.merged_tags
}

resource "aws_iam_role" "apprunner_instance" {
  name = "${local.resource_prefix}-apprunner-instance"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.merged_tags
}

resource "aws_iam_role_policy" "apprunner_openai_secret_access" {
  count = trimspace(var.openai_api_key_secret_arn) == "" ? 0 : 1
  name  = "${local.resource_prefix}-apprunner-openai-secret-access"
  role  = aws_iam_role.apprunner_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = trimspace(var.openai_api_key_secret_arn)
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_access" {
  role       = aws_iam_role.apprunner_ecr_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_vpc_connector" "main" {
  vpc_connector_name = "${local.resource_prefix}-vpc-connector"
  subnets = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]
  security_groups = [aws_security_group.apprunner_vpc_connector.id]

  tags = local.merged_tags
}

resource "aws_apprunner_service" "app" {
  service_name = local.resource_prefix

  source_configuration {
    auto_deployments_enabled = false

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }

    image_repository {
      image_repository_type = "ECR"
      image_identifier      = "${aws_ecr_repository.app.repository_url}:${var.app_image_tag}"

      image_configuration {
        port                          = tostring(var.app_port)
        runtime_environment_variables = local.apprunner_runtime_environment_variables
        runtime_environment_secrets   = local.apprunner_runtime_environment_secrets
      }
    }
  }

  instance_configuration {
    cpu               = var.app_cpu
    memory            = var.app_memory
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
    }
  }

  tags = local.merged_tags

  depends_on = [
    aws_iam_role_policy_attachment.apprunner_ecr_access
  ]
}
