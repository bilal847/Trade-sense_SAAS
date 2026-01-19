// Simple auth service for frontend
class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Check if we have a token in localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  public isAuthenticated(): boolean {
    return this.token !== null;
  }

  public logout(): void {
    this.removeToken();
  }
}

export default AuthService.getInstance();