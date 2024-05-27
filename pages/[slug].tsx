import styles from "@/styles/Home.module.css";

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

import { executeQuery } from "@/lib/fetch-contents";
import Link from "next/link";

type CurrentPost = {
  slug: string;
  title: string;
  content: {
    value: string;
  };
  _firstPublishedAt: string;
  author: {
    id: string;
    name: string;
  }
}

const CURRENT_POST_QUERY = `
query CurrentPost($slug: String) {
  currentPost: post(filter: { slug: { eq: $slug }}) {
    slug
    title
    content {
      value
    }
    _firstPublishedAt
    author {
      id
      name
    }
  }
}
`;

type PreviousAndNextPost = {
  slug: string;
  title: string;
  _firstPublishedAt: string;
  _status: string;
}


const PREVIOUS_AND_NEXT_POSTS_QUERY = `
query PreviousAndNextPosts($firstPublishedAt: DateTime, $slug: String) {
  previousPost: post(
    orderBy: _firstPublishedAt_DESC,
    filter: {slug: {neq: $slug}, _firstPublishedAt: {lt: $firstPublishedAt}}
  ) {
    id
    title
    slug
    _status
    _firstPublishedAt
  }
  
  nextPost: post(
    orderBy: _firstPublishedAt_ASC,
    filter: {slug: {neq: $slug}, _firstPublishedAt: {gt: $firstPublishedAt}}
  ) {
    id
    title
    slug
    _status
    _firstPublishedAt
  }
}
`;

export const getServerSideProps: GetServerSideProps<{ currentPost: CurrentPost, previousPost: PreviousAndNextPost, nextPost: PreviousAndNextPost }, { slug: string }> = (async ({ res, params }) => {
  const { slug } = params!;

  const { data: currentPostData, tags: currentPostTags } = await executeQuery(
    CURRENT_POST_QUERY,
    { slug },
  );

  const { currentPost } = currentPostData;
  const { _firstPublishedAt: firstPublishedAt } = currentPost;

  const { data: previousAndNextPostsData, tags: previousAndNextPostsTags } =
    await executeQuery(PREVIOUS_AND_NEXT_POSTS_QUERY, {
      firstPublishedAt,
      slug,
    });

  const { previousPost, nextPost } = previousAndNextPostsData;
  
	const pageCacheTags = [...currentPostTags, ...previousAndNextPostsTags];


  res.setHeader('Netlify-CDN-Cache-Control',  'public, s-maxage=31536000, must-revalidate');
  res.setHeader('Netlify-Cache-Tag', pageCacheTags.join(','))
  
  return {
    props: { currentPost, previousPost, nextPost }
  };
});

export default function PostPage({ currentPost, previousPost, nextPost }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <h1>{currentPost.title}</h1>

      <p><Link href={`/authors/${currentPost.author.id}`}>{currentPost.author.name}</Link></p>

      <ul className="horizontal navigation">
        <li>
          Previous:{" "}
          {previousPost ? (
            <Link href={`/${previousPost.slug}`}>{previousPost.title}</Link>
          ) : (
            "—"
          )}
        </li>
        <li>
          Next:{" "}
          {nextPost ? (
            <Link href={`/${nextPost.slug}`}>{nextPost.title}</Link>
          ) : (
            "—"
          )}
        </li>
      </ul>
    </>
  );
}
