export interface ChangePasswordModel {
  id?: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const newChangePasswordModel = {
  id: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}
