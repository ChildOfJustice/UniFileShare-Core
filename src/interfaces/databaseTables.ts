export interface FileMetadata {
    name: string
    S3uniqueName: string
    cloud: string
    uploadedBy: string
    ownedBy: string
    sizeOfFile_MB: number
    tagsKeys: string[]
    tagsValues: string[]
}

export interface Cluster {
    id: string
    owner_user_id: string
    ownedBy: string
    created: string
}

export interface CognitoRole {
    cognito_user_group: string
    role: string
}