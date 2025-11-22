import type { Route } from "./+types/index";
import FeaturedProjects from "~/components/FeaturedProjects";
import AboutPreview from "~/components/AboutPreview";
import type {
  Project,
  Post,
  StrapiResponse,
  StrapiProject,
  StrapiPost
} from "~/types";
import LatestPosts from "~/components/LatestPosts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "The Friendly Dev | Welcome" },
    { name: "description", content: "Custom website development" }
  ];
}

// loader
export async function loader({
  request
}: Route.LoaderArgs): Promise<{ projects: Project[]; posts: Post[] }> {
  // fetch both projects and posts in one go
  // Use filter to get featured projects
  const url = new URL(request.url);
  const [projectRes, postRes] = await Promise.all([
    fetch(
      `${import.meta.env.VITE_API_URL}/projects?filters[featured][$eq]=true&populate=*`
    ),
    fetch(`${import.meta.env.VITE_API_URL}/posts?sort[0]=date:desc&populate=*`)
  ]);

  if (!projectRes.ok || !postRes.ok) {
    throw new Error("Failed to fetch projects or posts");
  }

  // Get featured projects from response
  const projectJson: StrapiResponse<StrapiProject> = await projectRes.json();

  const postJson: StrapiResponse<StrapiPost> = await postRes.json();

  // Remap Strapi attributes to projects attributes
  const projects = projectJson.data.map(item => ({
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description,
    image: item.image?.url
      ? `${item.image.url}`
      : "/images/no-image.png",
    url: item.url,
    date: item.date,
    category: item.category,
    featured: item.featured
  }));

  // Remap Strapi attributes to posts attributes
  const posts = postJson.data.map(item => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: item.body,
    image: item.image?.url
      ? `${item.image.url}`
      : "/images/no-image.png",
    date: item.date
  }));

  return { projects, posts };
}

const HomePage = ({ loaderData }: Route.ComponentProps) => {
  const { projects, posts } = loaderData;

  return (
    <>
      <FeaturedProjects projects={projects} />
      <AboutPreview />
      <LatestPosts posts={posts} />
    </>
  );
};

export default HomePage;
