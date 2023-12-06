import { google } from "googleapis";
import { EventData, TypedEventEmitter } from "./TypedEventEmitter";

const OAuth2Client = new google.auth.OAuth2();

interface YouTubeChannel {
    id: string,
    name: string,
    description?: string | null,
    customUrl: string
}

export interface YouTubeCredentialHolderEvents extends EventData {
    provided: () => void
}

export class YouTubeCredentialsHolder extends TypedEventEmitter<YouTubeCredentialHolderEvents> {

    public readonly youtube = google.youtube("v3");
    private _client!: typeof OAuth2Client;
    private _channel!: YouTubeChannel;

    private emitProvidedEvent() {
        if (!this._client || !this._channel) return;
        this.emit("provided");
    }
    
    set client(client: typeof OAuth2Client) {
        this._client = client;
        this.emitProvidedEvent();
    }
    get client() {
        return this._client;
    }

    set channel(channel: YouTubeChannel) {
        this._channel = channel;
        this.emitProvidedEvent();
    }
    get channel() {
        return this._channel;
    }

}