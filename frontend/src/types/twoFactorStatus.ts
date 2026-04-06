export type TwoFactorStatus = {
  sharedKey: string;
  recoveryCodesLeft: number;
  recoveryCodes: string[];
  isTwoFactorEnabled: boolean;
  isMachineRemembered: boolean;
};
