import { ApiClient, HelixUser } from '@twurple/api';
import { TypedEventEmitter, EventData } from "./BasicTypedEventEmitter";
import { EventSubWsListener } from "@twurple/eventsub-ws";

export interface TwitchCredentialHolderEvents extends EventData {
    provided: () => void
}

export class TwitchCredentialsHolder extends TypedEventEmitter<TwitchCredentialHolderEvents> {
    
    private _api!: ApiClient;
    private _user!: HelixUser;
    private _eventSubListener!: EventSubWsListener;

    private emitProvidedEvent() {
        if (!this._api || !this._user || !this._eventSubListener) return;
        this.emit("provided");
    }

    set api(api: ApiClient) {
        this._api = api;
        this.emitProvidedEvent();
    }
    get api() {
        return this._api;
    }

    set user(user: HelixUser) {
        this._user = user;
        this.emitProvidedEvent();
    }
    get user() {
        return this._user;
    }

    set eventSubListener(listener: EventSubWsListener) {
        this._eventSubListener = listener;
        this.emitProvidedEvent();
    }
    get eventSubListener() {
        return this._eventSubListener;
    }

}