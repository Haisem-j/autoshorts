import Document, { Html, Main, Head, NextScript } from 'next/document';
import { loadSelectedTheme } from '~/core/theming';
import { isBrowser } from '~/core/generic/is-browser';
import configuration from '~/configuration';

export default class MyDocument extends Document {
  render() {
    return (
      <Html className={this.getTheme()}>
        <Head />

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

  private getTheme() {
    const defaultTheme = configuration.theme;

    if (isBrowser()) {
      const theme = loadSelectedTheme();

      return theme ?? defaultTheme;
    }

    return defaultTheme;
  }
}
