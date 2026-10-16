import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  userId: string | null;
}

@Injectable()
export class CurrentUserContext {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  
  // Get current user
  setUserId(userId: string | null): void {


    // const store2 = this.storage2.getStore();


    const store = this.storage.getStore();
    if (!store) {
      return;
    }
    store.userId = userId;
  }

  // Get current user
  get userId(): string | null {
    return this.storage.getStore()?.userId ?? null;
    // return this.storage.getStore()?.userId ?? '160262e1-591e-4d93-a7b1-04ab41148b47';
  }

  //=============================================================
  run<T>(callback: () => T): T {
    return this.storage.run(
      {
        userId: null,
      },
      callback,
    );
  }

  runAs<T>(userId: string | null, callback: () => T): T {
    return this.storage.run(
      {
        userId,
      },
      callback,
    );
  }
}
