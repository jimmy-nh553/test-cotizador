export interface TokenClaim {
    issuer:         string;
    originalIssuer: string;
    properties:     Properties;
    subject:        null;
    type:           string;
    value:          string;
    valueType:      string;
}

export interface Properties {
}

export interface UserNameClaim {
    type?: string;
    value?: string;
}