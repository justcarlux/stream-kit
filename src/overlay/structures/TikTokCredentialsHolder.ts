import { EventData, TypedEventEmitter } from "./BasicTypedEventEmitter";

export interface TikTokCredentialHolderEvents extends EventData {
    provided: () => void
}

export class TikTokCredentialsHolder extends TypedEventEmitter<TikTokCredentialHolderEvents> {
    
    // private _api!: ApiClient;
    // private _eventSubListener!: EventSubWsListener;

    // private emitProvidedEvent() {
    //     if (!this._api || !this._user || !this._eventSubListener) return;
    //     this.emit("provided");
    // }

    // set api(api: ApiClient) {
    //     this._api = api;
    //     this.emitProvidedEvent();
    // }
    // get api() {
    //     return this._api;
    // }

    // set eventSubListener(listener: EventSubWsListener) {
    //     this._eventSubListener = listener;
    //     this.emitProvidedEvent();
    // }
    // get eventSubListener() {
    //     return this._eventSubListener;
    // }

}