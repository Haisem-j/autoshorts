import Head from 'next/head';
import Link from 'next/link';

import { withTranslationProps } from '~/lib/props/with-translation-props';

import PostTitle from '~/components/blog/PostTitle';
import PostsList from '~/components/blog/PostsList';
import SiteHeader from '~/components/SiteHeader';

import {
  getPostsByCollection,
  getCollections,
  getCollectionByName,
} from '~/core/blog/api';

import Post from '~/core/blog/types/post';
import Collection from '~/core/blog/types/collection';

import Layout from '~/core/ui/Layout';
import Container from '~/core/ui/Container';
import If from '~/core/ui/If';
import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import i18nextConfig from '../../../next-i18next.config';

type Props = {
  posts: Post[];
  collection: Collection;
};

const CollectionPosts = ({ posts, collection }: Props) => {
  return (
    <Layout>
      <Head>
        <title key="title">{collection.name}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <SiteHeader />

      <Container>
        <PostTitle>
          <span className={'flex space-x-2'}>
            <Link className={'hover:underline'} href={'/blog'}>
              Blog
            </Link>
            <span>/</span>
            <span>{collection.name}</span>
          </span>
        </PostTitle>

        <div className="mt-8 flex flex-col space-y-8 md:mt-12">
          <If condition={posts.length}>
            <PostsList posts={posts} />
          </If>
        </div>
      </Container>
    </Layout>
  );
};

export default CollectionPosts;

type Params = {
  slug: string;
  collection: string;
};

export async function getStaticProps({
  params,
  locale,
}: GetStaticPropsContext) {
  const { collection: collectionName } = params as Params;

  const { props } = await withTranslationProps({ locale });
  const collection = getCollectionByName(collectionName);
  const posts = getPostsByCollection(collectionName);

  return {
    props: {
      ...props,
      posts,
      collection,
    },
  };
}

export function getStaticPaths() {
  const locales = i18nextConfig.i18n.locales;
  const paths: GetStaticPathsResult['paths'] = [];

  getCollections().forEach((collection) => {
    for (const locale of locales) {
      const collectionName = collection?.name.toLowerCase();

      paths.push({
        params: {
          collection: collectionName,
        },
        locale,
      });
    }
  });

  return {
    paths,
    fallback: false,
  };
}
