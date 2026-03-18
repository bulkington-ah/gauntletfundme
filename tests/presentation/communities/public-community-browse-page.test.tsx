import { render, screen } from "@testing-library/react";

import type { PublicCommunityListResponse } from "@/application";
import {
  PublicCommunityBrowsePage,
  buildPublicCommunityBrowsePageModel,
} from "@/presentation/communities";

describe("PublicCommunityBrowsePage", () => {
  it("builds a browse page model from the public community list query", async () => {
    const query = createPublicCommunityListQueryStub({
      result: {
        kind: "community_list",
        communities: [
          {
            slug: "neighbors-helping-neighbors",
            name: "Neighbors Helping Neighbors",
            visibility: "public",
            description: "A public space for updates and volunteer coordination.",
            followerCount: 4,
            fundraiserCount: 4,
            owner: {
              displayName: "Avery Johnson",
              role: "organizer",
              profileSlug: "avery-johnson",
              avatarUrl: null,
            },
          },
        ],
      },
    });

    const model = await buildPublicCommunityBrowsePageModel({
      publicCommunityQuery: query,
    });

    expect(query.listPublicCommunities).toHaveBeenCalledTimes(1);
    expect(model).toEqual({
      status: "success",
      communities: [
        {
          slug: "neighbors-helping-neighbors",
          name: "Neighbors Helping Neighbors",
          visibility: "public",
          description: "A public space for updates and volunteer coordination.",
          followerCount: 4,
          fundraiserCount: 4,
          owner: {
            displayName: "Avery Johnson",
            role: "organizer",
            profileSlug: "avery-johnson",
            avatarUrl: null,
          },
        },
      ],
    });
  });

  it("renders community browse cards that link to the public community pages", () => {
    render(
      <PublicCommunityBrowsePage
        model={{
          status: "success",
          communities: [
            {
              slug: "neighbors-helping-neighbors",
              name: "Neighbors Helping Neighbors",
              visibility: "public",
              description: "A public space for updates and volunteer coordination.",
              followerCount: 4,
              fundraiserCount: 4,
              owner: {
                displayName: "Avery Johnson",
                role: "organizer",
                profileSlug: "avery-johnson",
                avatarUrl: null,
              },
            },
            {
              slug: "weekend-pantry-crew",
              name: "Weekend Pantry Crew",
              visibility: "public",
              description: "Pantry packing, delivery help, and same-day volunteer asks.",
              followerCount: 3,
              fundraiserCount: 4,
              owner: {
                displayName: "Avery Johnson",
                role: "organizer",
                profileSlug: "avery-johnson",
                avatarUrl: null,
              },
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "See where supporters keep showing up" }),
    ).toBeInTheDocument();
    expect(screen.getByText("public communities")).toBeInTheDocument();
    expect(screen.getByText("combined followers")).toBeInTheDocument();

    const neighborsCard = screen.getByRole("link", {
      name: /Neighbors Helping Neighbors/i,
    });
    const pantryCard = screen.getByRole("link", {
      name: /Weekend Pantry Crew/i,
    });

    expect(neighborsCard).toHaveAttribute(
      "href",
      "/communities/neighbors-helping-neighbors",
    );
    expect(pantryCard).toHaveAttribute("href", "/communities/weekend-pantry-crew");
  });
});

const createPublicCommunityListQueryStub = ({
  result,
}: {
  result: PublicCommunityListResponse;
}) => ({
  listPublicCommunities: vi.fn().mockResolvedValue(result),
});
