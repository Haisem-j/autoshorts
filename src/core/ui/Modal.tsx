import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { Trans } from 'next-i18next';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

import IconButton from '~/core/ui/IconButton';
import If from '~/core/ui/If';
import Button from '~/core/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '~/core/ui/Dialog';

const Modal: React.FC<
  React.PropsWithChildren<{
    heading: string | JSX.Element;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => unknown;
    closeButton?: boolean;
  }>
> & {
  CancelButton: typeof CancelButton;
} = ({ isOpen, setIsOpen, closeButton, heading, children }) => {
  const useCloseButton = closeButton ?? true;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (useCloseButton && !open) {
          setIsOpen(false);
        }
      }}
    >
      <Transition
        as={Fragment}
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-20"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-30"
      >
        <DialogContent>
          <div className="h-full min-h-screen px-4 text-center">
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block max-h-[90%] w-full max-w-xl transform overflow-auto rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-black-400">
              <div className={'flex flex-col space-y-4'}>
                <div className="flex items-center">
                  <DialogTitle className="flex w-full text-xl font-semibold text-current">
                    {heading}
                  </DialogTitle>

                  <If condition={useCloseButton}>
                    <div className={'justify-end'}>
                      <IconButton
                        label={'Close Modal'}
                        onClick={() => setIsOpen(false)}
                      >
                        <XMarkIcon className={'h-6'} />
                      </IconButton>
                    </div>
                  </If>
                </div>

                <div className="relative">{children}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Transition>
    </Dialog>
  );
};

export default Modal;

function CancelButton<Props extends React.ButtonHTMLAttributes<unknown>>(
  props: Props
) {
  return (
    <Button
      type={'button'}
      data-cy={'close-modal-button'}
      color={'transparent'}
      {...props}
    >
      <Trans i18nKey={'common:cancel'} />
    </Button>
  );
}

Modal.CancelButton = CancelButton;
