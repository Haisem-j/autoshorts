import { Trans, useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';

import TextField from '~/core/ui/TextField';
import Button from '~/core/ui/Button';
import If from '~/core/ui/If';

const EmailPasswordSignUpForm: React.FCC<{
  onSubmit: (params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
}> = ({ onSubmit, loading }) => {
  const { t } = useTranslation();

  const { register, handleSubmit, watch } = useForm({
    shouldUseNativeValidation: true,
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: '',
    },
  });

  const emailControl = register('email', { required: true });

  const passwordControl = register('password', {
    required: true,
    minLength: 6,
  });

  const passwordValue = watch(`password`);

  const repeatPasswordControl = register('repeatPassword', {
    required: true,
    minLength: 6,
    validate: (value) => {
      if (value !== passwordValue) {
        return t(`auth:passwordsDoNotMatch`);
      }

      return true;
    },
  });

  return (
    <form className={'w-full'} onSubmit={handleSubmit(onSubmit)}>
      <div className={'flex-col space-y-2.5'}>
        <TextField>
          <TextField.Label>
            <Trans i18nKey={'common:emailAddress'} />

            <TextField.Input
              data-cy={'email-input'}
              required
              type="email"
              placeholder={'your@email.com'}
              innerRef={emailControl.ref}
              onBlur={emailControl.onBlur}
              onChange={emailControl.onChange}
              name={emailControl.name}
            />
          </TextField.Label>
        </TextField>

        <TextField>
          <TextField.Label>
            <Trans i18nKey={'common:password'} />

            <TextField.Input
              data-cy={'password-input'}
              required
              type="password"
              placeholder={''}
              innerRef={passwordControl.ref}
              onBlur={passwordControl.onBlur}
              onChange={passwordControl.onChange}
              name={passwordControl.name}
            />

            <TextField.Hint>
              <Trans i18nKey={'auth:passwordHint'} />
            </TextField.Hint>
          </TextField.Label>
        </TextField>

        <TextField>
          <TextField.Label>
            <Trans i18nKey={'auth:repeatPassword'} />

            <TextField.Input
              data-cy={'repeat-password-input'}
              required
              type="password"
              placeholder={''}
              innerRef={repeatPasswordControl.ref}
              onBlur={repeatPasswordControl.onBlur}
              onChange={repeatPasswordControl.onChange}
              name={repeatPasswordControl.name}
            />
          </TextField.Label>
        </TextField>

        <div>
          <Button
            size={'large'}
            data-cy={'auth-submit-button'}
            className={'w-full'}
            color={'primary'}
            type="submit"
            loading={loading}
          >
            <If
              condition={loading}
              fallback={<Trans i18nKey={'auth:signUp'} />}
            >
              <Trans i18nKey={'auth:signingUp'} />
            </If>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EmailPasswordSignUpForm;
