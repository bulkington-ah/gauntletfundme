import type {
  ApplicationApi,
  AuthenticatedViewer,
  ViewerOwnedCommunitySummary,
} from "@/application";
import { PublicSiteShell } from "@/presentation/shared";

import { CreateFundraiserForm } from "./create-fundraiser-form";
import styles from "./create-fundraiser-page.module.css";

type ViewerOwnedCommunityListQuery = Pick<
  ApplicationApi,
  "listOwnedCommunitiesForViewer"
>;

export type CreateFundraiserPageModel = {
  ownedCommunities: ViewerOwnedCommunitySummary[];
};

type BuildDependencies = {
  viewerOwnedCommunityListQuery: ViewerOwnedCommunityListQuery;
};

export const buildCreateFundraiserPageModel = async (
  dependencies: BuildDependencies,
  ownerUserId: string,
): Promise<CreateFundraiserPageModel> => {
  const result = await dependencies.viewerOwnedCommunityListQuery
    .listOwnedCommunitiesForViewer(ownerUserId);

  return {
    ownedCommunities: result.communities,
  };
};

type CreateFundraiserPageProps = {
  model: CreateFundraiserPageModel;
  viewer: AuthenticatedViewer;
  viewerProfileSlug?: string | null;
};

export function CreateFundraiserPage({
  model,
  viewer,
  viewerProfileSlug = null,
}: CreateFundraiserPageProps) {
  return (
    <PublicSiteShell
      returnTo="/fundraisers/create"
      viewer={viewer}
      viewerProfileSlug={viewerProfileSlug}
    >
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Create fundraiser</p>
          <h1 className={styles.heading}>Launch a public fundraiser page</h1>
          <p className={styles.lead}>
            Create an active fundraiser that supporters can discover right away.
            You&apos;ll be set as the owner automatically, and you can optionally
            link it to one of your communities.
          </p>

          <CreateFundraiserForm
            communities={model.ownedCommunities}
            nextPath="/fundraisers/create"
          />
        </section>
      </main>
    </PublicSiteShell>
  );
}
