import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { JwtHelperService } from '@auth0/angular-jwt';
import { AccountService } from '@services/system/account.service';

export interface UserInfo {
  userName: string;
  userId: number;
  authCode: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserInfoStoreService {
  $userInfo = signal<UserInfo>({ userId: -1, userName: '', authCode: [] });

  userService = inject(AccountService);

  parsToken(token: string): UserInfo {
    const helper = new JwtHelperService();
    try {
      const { userName, sub } = helper.decodeToken(token);
      return {
        userId: sub,
        userName,
        authCode: []
      };
    } catch (e) {
      return {
        userId: -1,
        userName: '',
        authCode: []
      };
    }
  }

  getUserAuthCodeByUserId(userId: number): Observable<string[]> {
    return this.userService.getAccountAuthCode(userId);
  }
}
