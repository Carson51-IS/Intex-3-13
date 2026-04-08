export interface AuthSession {
    userId?: string | null,
    isAuthenticated: boolean,
    userName: string | null,
    email: string | null,
    phoneNumber?: string | null,
    currencyPreference?: 'PHP' | 'USD' | null,
    profileImageUrl?: string | null,
    roles: string[],
}