import React from "react";

export type LastPost = { slug: string, title: string };

type Props = { lastPosts: LastPost[] };

function LastPosts({lastPosts}: Props) {
  return (
    <ul>
      {lastPosts.map(({ slug, title }) => (
        <li key={slug}>
          <a href={`/${slug}`}>{title}</a>
        </li>
      ))}
    </ul>
  );
}

export default LastPosts;
