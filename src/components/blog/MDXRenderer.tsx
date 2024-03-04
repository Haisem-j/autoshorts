import { Fragment } from 'react';

import * as runtime from 'react/jsx-runtime';
import { runSync } from '@mdx-js/mdx';
import type { NestedMDXComponents } from 'mdx/types';
import MDXComponents from '~/components/blog/MDXComponents';

function MDXRenderer({ code }: { code: string }) {
  const MDXModule = runSync(code, {
    ...runtime,
    baseUrl: import.meta.url,
    Fragment,
  });

  return (
    <MDXModule.default components={MDXComponents as NestedMDXComponents} />
  );
}

export default MDXRenderer;
