import type { PublicContentReadRepository } from "./ports";

type Dependencies = {
  publicContentReadRepository: PublicContentReadRepository;
};

export const getPublicProfileSlugByUserId = async (
  dependencies: Dependencies,
  userId: string,
): Promise<string | null> =>
  dependencies.publicContentReadRepository.findProfileSlugByUserId(userId);
