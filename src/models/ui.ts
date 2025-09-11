
import { IUiState, Screen } from '../types/ui';
import { IEvents } from '../components/base/events';
import { AppEvent } from '../types/events';

export class UiStateModel {
  private state: IUiState = { screen: 'catalog' };

  constructor(private events: IEvents) {}

  getState(): IUiState {
    return this.state;
  }

  navigate(screen: Screen, payload: Partial<IUiState> = {}) {
    this.state = { screen, ...payload };
    this.events.emit(AppEvent.ScreenChanged, this.state);
  }
}
