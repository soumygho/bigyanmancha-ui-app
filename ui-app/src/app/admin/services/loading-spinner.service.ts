import { computed, effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingSpinnerService {
  private _count = signal(0);
  private readonly _isLoading = signal(false);
  readonly isLoading = computed(() => this._isLoading());

  constructor() {
    effect(
      () => {
        this._isLoading.set(this._count() > 0);
      },
      { allowSignalWrites: true }
    );
  }

  show(): void {
    this._count.update((n) => n + 1);
  }

  hide(): void {
    this._count.update((n) => Math.max(0, n - 1));
  }
}
