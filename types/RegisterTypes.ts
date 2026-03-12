export interface RegisterForm {

    displayName: string;
    email: string;
    password: string;
}

export const initialState: RegisterForm = {
    displayName: '',
    email: '',
    password: '',
};