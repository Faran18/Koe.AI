import { queryProducts } from "@/lib/api";
import HomeExperience from "@/components/HomeExperience";

export default async function Home() {
  const { items } = await queryProducts({ sort: "rating", limit: 9 });
  return <HomeExperience hero={items[0]} rail={items.slice(1)} />;
}
