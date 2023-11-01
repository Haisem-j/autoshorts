import organizationPageObject from '../../support/organization.po';
import authPo from '../../support/auth.po';

describe(`Delete Organization`, () => {
  const random = Math.round(Math.random() * 1000);
  const email = `delete-organization+${random}@makerkit.dev`;
  const orgName = `Leave Organization Test ${random}`;

  beforeEach(() => {
    cy.signUp(
      `/settings/organization`,
      {
        email,
        password: authPo.getDefaultUserPassword(),
      },
      orgName,
    );
  });

  describe(`When the user is an owner`, () => {
    it(`should be able to delete the organization`, () => {
      organizationPageObject.$getDeleteOrganizationButton().click();

      organizationPageObject
        .$getDeleteOrganizationConfirmInput()
        .clear()
        .type(orgName);

      organizationPageObject.$getConfirmDeleteOrganizationButton().click();

      cy.url().should('contain', '/onboarding');
    });
  });
});
