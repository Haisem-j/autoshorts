import { useCallback } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import type { User } from 'firebase/auth';
import toaster from 'react-hot-toast';

import Button from '~/core/ui/Button';
import Modal from '~/core/ui/Modal';
import If from '~/core/ui/If';

import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';
import useTransferOrganizationOwnership from '~/lib/organizations/hooks/use-transfer-organization-ownership';

const TransferOrganizationOwnershipModal: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  member: User;
}> = ({ isOpen, setIsOpen, member }) => {
  const targetMemberDisplayName = member.displayName ?? member.email;
  const targetMemberId = member.uid;
  const { t } = useTranslation();
  const heading = <Trans i18nKey="organization:transferOwnership" />;

  const organization = useCurrentOrganization();
  const organizationId = organization?.id ?? '';

  const [transferOrganizationOwnership, transferOrganizationOwnershipState] =
    useTransferOrganizationOwnership(organizationId);

  const loading = transferOrganizationOwnershipState.loading;

  const onConfirmTransferOwnership = useCallback(async () => {
    const promise = transferOrganizationOwnership({ userId: targetMemberId });

    await toaster.promise(promise, {
      loading: t('organization:transferringOwnership'),
      success: t('organization:transferOwnershipSuccess'),
      error: t('organization:transferOwnershipError'),
    });

    setIsOpen(false);
  }, [setIsOpen, t, targetMemberId, transferOrganizationOwnership]);

  return (
    <Modal heading={heading} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className={'flex flex-col space-y-4'}>
        <p>
          <Trans
            i18nKey={'organization:transferOwnershipDisclaimer'}
            values={{
              member: targetMemberDisplayName,
            }}
            components={{ b: <b /> }}
          />
        </p>

        <p>
          <Trans i18nKey={'common:modalConfirmationQuestion'} />
        </p>

        <Button
          block
          data-cy={'confirm-transfer-ownership-button'}
          color={'danger'}
          onClick={onConfirmTransferOwnership}
          loading={loading}
        >
          <If
            condition={loading}
            fallback={<Trans i18nKey={'organization:transferOwnership'} />}
          >
            <Trans i18nKey={'organization:transferringOwnership'} />
          </If>
        </Button>
      </div>
    </Modal>
  );
};

export default TransferOrganizationOwnershipModal;
