import { getCompanies, getPosts, getPostCount } from "@/lib/supabase";
import { Feed } from "@/components/feed";
import { Footer } from "@/components/footer";
import { Container } from "@/components/container";
import DecryptedText from "@/components/decrypted-text";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function HomePage() {
  const [companies, posts, totalCount] = await Promise.all([
    getCompanies({ minPosts: 2 }),
    getPosts({ offset: 0, limit: 20 }),
    getPostCount(),
  ]);

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Container size="default" className="pt-8 pb-4 sm:pt-10">
        {/* Hero Section */}
        <header className="flex min-h-[46vh] flex-col justify-center pb-10 pt-4 sm:min-h-[48vh] sm:pb-14 sm:pt-6">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl dark:text-white leading-[1.04]">
            Engineering Blogs,{" "}
            <DecryptedText
              text="Without the Noise"
              animateOn="hover"
              sequential={true}
              revealDirection="start"
              speed={45}
              useOriginalCharsOnly={false}
              characters="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+"
              className="text-neutral-950 dark:text-white"
              encryptedClassName="text-neutral-950/40 dark:text-white/40"
              parentClassName="cursor-pointer"
            />
          </h1>
          <p className="mt-5 max-w-2xl font-mono text-xs leading-relaxed text-neutral-950/70 sm:text-sm sm:leading-relaxed dark:text-white/70">
            Stop checking dozens of company sites individually. Find technical blogs from top engineering teams, all in one place. Links straight to the source.
          </p>
        </header>

        {/* Interactive Client Feed (Search, Filter, Cards) */}
        <section aria-label="Engineering Posts Feed">
          <Feed initialPosts={posts} companies={companies} totalCount={totalCount} />
        </section>
      </Container>

      {/* Sleek Footer with Fair Use Guardrails */}
      <Footer />
    </main>
  );
}
