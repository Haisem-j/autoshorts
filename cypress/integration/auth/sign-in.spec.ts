import auth from '../../support/auth.po';
import configuration from '~/configuration';

describe(`Sign in`, () => {
  beforeEach(() => {
    cy.visit(`/auth/sign-in`);
  });

  describe(`given the user signs in with email/password`, () => {
    describe(`when the request is not successful`, () => {
      it('should display an error message', () => {
        const email = `awrongemail@makerkit.dev`;
        const password = `somePassword`;

        auth.signInWithEmailAndPassword(email, password);
        auth.$getErrorMessage().should('exist');
      });
    });

    describe(`when the request is successful`, () => {
      it('should take the user to the app home page', () => {
        const email = Cypress.env('EMAIL') as string;
        const password = Cypress.env('PASSWORD') as string;

        auth.signInWithEmailAndPassword(email, password);
        cy.url().should('contain', configuration.paths.appHome);
      });
    });
  });

  describe(`When the user logs in with a "redirectUrl" query parameter`, () => {
    const returnUrl = `/settings/organization/members`;

    before(() => {
      cy.clearStorage();
      cy.reload();
    });

    it('should redirect to the route provided', () => {
      cy.visit(`/auth/sign-in?returnUrl=${returnUrl}`);

      const email = Cypress.env('EMAIL') as string;
      const password = Cypress.env('PASSWORD') as string;

      auth.signInWithEmailAndPassword(email, password);
      cy.url().should('contain', returnUrl);
    });
  });
});
