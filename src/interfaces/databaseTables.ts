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

export interface File_ClusterSub {
    fileId: string
    clusterId: string
}

export interface Cluster {
    clusterId: number | null
    name: string
    ownerUserId: string
    // createdDate: string
}

export interface Role {
    role: string
}