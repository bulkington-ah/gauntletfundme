output "ecr_repository_url" {
  description = "ECR repository URL used for image push and deployment tagging."
  value       = aws_ecr_repository.app.repository_url
}

output "apprunner_service_arn" {
  description = "ARN of the deployed App Runner service."
  value       = aws_apprunner_service.app.arn
}

output "apprunner_service_url" {
  description = "Public service URL exposed by App Runner."
  value       = aws_apprunner_service.app.service_url
}

output "rds_endpoint" {
  description = "Private RDS endpoint hostname."
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "Private RDS endpoint port."
  value       = aws_db_instance.postgres.port
}

output "rds_database_name" {
  description = "Provisioned application database name."
  value       = aws_db_instance.postgres.db_name
}
