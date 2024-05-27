import styles from "@/styles/Home.module.css";

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

import LastPosts, { LastPost } from "../components/LastPosts";
import { executeQuery } from "@/lib/fetch-contents";

const QUERY = `
  {
    allPosts(orderBy: _firstPublishedAt_DESC) {
      title
      slug
      _firstPublishedAt
    }
  }
`;

export const getServerSideProps = (async ({ res }) => {
  const { data, tags } = await executeQuery(QUERY);

  const { allPosts: lastPosts } = data;

  res.setHeader('Netlify-CDN-Cache-Control',  'public, s-maxage=31536000, must-revalidate');
  res.setHeader('Netlify-Cache-Tag', tags.join(','))
  
  return {
    props: { lastPosts }
  };
}) satisfies GetServerSideProps<{ lastPosts: LastPost[] }>

export default function Home({ lastPosts }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className={styles.main}>
      <LastPosts lastPosts={lastPosts} />
    </main>
  );
}
