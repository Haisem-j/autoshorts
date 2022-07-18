import Head from 'next/head';
import React from 'react';

import { getStructuredData } from '~/core/blog/structured-data';
import configuration from '~/configuration';

import Post from '~/core/blog/types/post';
import Layout from '~/core/ui/Layout';
import SectionSeparator from '~/core/ui/SectionSeparator';
import Container from '~/core/ui/Container';
import Footer from '~/components/Footer';
import If from '~/core/ui/If';
import Badge from '~/core/ui/Badge';

import PostBody from './PostBody';
import PostHeader from './PostHeader';
import PostsList from './PostsList';
import CollectionName from './CollectionName';
import SiteHeader from '../SiteHeader';
import Collection from '~/core/blog/types/collection';

const Post: React.FCC<{
  post: Post;
  morePosts: Post[];
  content: string;
}> = ({ post, morePosts, content }) => {
  return (
    <Layout>
      <PostHead post={post} />

      <SiteHeader />

      <Container>
        <div className={'mx-auto max-w-2xl'}>
          <article className="mb-16">
            <PostHeader post={post} />

            <div className={'mx-auto flex justify-center md:mt-2'}>
              <PostBody content={content} />
            </div>
          </article>

          <If condition={morePosts.length}>
            <MorePostsList posts={morePosts} collection={post.collection} />
          </If>
        </div>
      </Container>

      <Footer />
    </Layout>
  );
};

function MorePostsList({
  posts,
  collection,
}: React.PropsWithChildren<{
  posts: Post[];
  collection: Collection;
}>) {
  return (
    <div>
      <SectionSeparator />

      <h3 className="my-4 flex flex-row items-center justify-center space-x-4 text-center font-semibold dark:text-white md:my-12">
        <span>Read more about</span>{' '}
        <Badge>
          <CollectionName logoSize="28px" collection={collection} />
        </Badge>
      </h3>

      <PostsList posts={posts} />
    </div>
  );
}

function PostHead({ post }: React.PropsWithChildren<{ post: Post }>) {
  const ogImage = post.ogImage?.url ?? post.coverImage;
  const title = post.title;
  const fullImagePath = `${configuration.site.siteUrl}${ogImage}`;

  const structuredDataJson = getStructuredData({
    type: 'Article',
    id: 'https://google.com/article',
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    imagePath: fullImagePath,
    author: {
      name: configuration.site.siteName,
      url: configuration.site.siteUrl,
    },
  });

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="og:title" property="og:title" content={title} />
      <meta key="twitter:title" property="twitter:title" content={title} />

      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={post.date} />

      <meta
        key="twitter:image"
        property="twitter:image"
        content={fullImagePath}
      />

      {post.excerpt && (
        <>
          <meta
            key="twitter:description"
            property="twitter:description"
            content={post.excerpt}
          />

          <meta
            key="og:description"
            property="og:description"
            content={post.excerpt}
          />

          <meta
            key="meta:description"
            name="description"
            content={post.excerpt}
          />
        </>
      )}

      {post.canonical && (
        <link rel="canonical" href={post.canonical} key="canonical" />
      )}

      {ogImage && (
        <meta key={'og:image'} property="og:image" content={ogImage} />
      )}

      <script
        key="ld:json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredDataJson),
        }}
      />
    </Head>
  );
}

export default Post;
