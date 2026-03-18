import type { PublicFundraiserListResponse } from "./contracts";
import { toPublicFundraiserBrowseEntry } from "./mappers";
import type {
  PublicContentReadRepository,
  PublicFundraiserSummarySnapshot,
} from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
};

export const listPublicFundraisers = async (
  dependencies: Dependencies,
): Promise<PublicFundraiserListResponse> => {
  const fundraisers = await dependencies.publicContentReadRepository.listFundraisers();

  return {
    kind: "fundraiser_list",
    fundraisers: [...fundraisers]
      .sort(compareFundraiserBrowsePriority)
      .map(toPublicFundraiserBrowseEntry),
  };
};

const fundraiserStatusRank: Record<
  PublicFundraiserSummarySnapshot["fundraiser"]["status"],
  number
> = {
  active: 0,
  draft: 1,
  closed: 2,
};

const compareFundraiserBrowsePriority = (
  left: PublicFundraiserSummarySnapshot,
  right: PublicFundraiserSummarySnapshot,
): number => {
  const leftStatusRank = fundraiserStatusRank[left.fundraiser.status];
  const rightStatusRank = fundraiserStatusRank[right.fundraiser.status];

  if (leftStatusRank !== rightStatusRank) {
    return leftStatusRank - rightStatusRank;
  }

  if (right.amountRaised !== left.amountRaised) {
    return right.amountRaised - left.amountRaised;
  }

  if (right.donationCount !== left.donationCount) {
    return right.donationCount - left.donationCount;
  }

  return right.fundraiser.createdAt.getTime() - left.fundraiser.createdAt.getTime();
};
