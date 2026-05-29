import { Component, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { IonSearchbar } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [IonSearchbar],
  template: `
    <ion-searchbar
      placeholder="Search movies..."
      show-cancel-button="focus"
      debounce="0"
      (ionInput)="onInput($event)"
    />
  `,
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() searched = new EventEmitter<string>();

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.input$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((query) => this.searched.emit(query));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(event: CustomEvent) {
    const value = (event as CustomEvent<{ value: string }>).detail.value ?? '';
    this.input$.next(value);
  }
}
