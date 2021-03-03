import {
    AnnotationSharingAccess,
    AnnotationSharingInfo,
} from 'src/content-sharing/ui/types'

import * as icons from 'src/common-ui/components/design-library/icons'

export interface SharingProps {
    sharingAccess: AnnotationSharingAccess
    sharingInfo?: AnnotationSharingInfo
    onShare: React.MouseEventHandler
    onUnshare: React.MouseEventHandler
}

export type SharingState =
    | 'feature-disabled'
    | 'already-shared'
    | 'sharing'
    | 'sharing-success'
    | 'sharing-error'
    | 'unsharing'
    | 'unsharing-success'
    | 'unsharing-error'
    | 'not-shared-yet'

export const SHARE_BUTTON_LABELS: {
    [Key in SharingState]: string
} = {
    'feature-disabled': 'Share Note',
    'not-shared-yet': 'Share Note',
    'already-shared': 'Get Note Link',
    sharing: 'Sharing Note...',
    'sharing-success': 'Note Shared',
    'sharing-error': 'Error Sharing Note',
    unsharing: 'Unsharing Note',
    'unsharing-success': 'Note Unshared',
    'unsharing-error': 'Error Un-sharing Note',
}

export const SHARE_BUTTON_ICONS: {
    [Key in SharingState]: string | null
} = {
    'feature-disabled': icons.lock,
    'not-shared-yet': icons.link,
    'already-shared': icons.shared,
    sharing: icons.shared,
    'sharing-success': icons.shared,
    'sharing-error': icons.lock,
    unsharing: icons.lock,
    'unsharing-success': icons.link,
    'unsharing-error': icons.shared,
}

export function getShareAnnotationBtnState({
    sharingAccess,
    sharingInfo,
}: SharingProps): SharingState {
    if (sharingAccess === 'feature-disabled') {
        return 'feature-disabled'
    }

    const info = sharingInfo ?? { status: 'unshared', taskState: 'pristine' }

    if (info.status === 'shared') {
        if (info.taskState === 'pristine') {
            return 'already-shared'
        }
        if (info.taskState === 'running') {
            return 'sharing'
        }
        if (info.taskState === 'success') {
            return 'sharing-success'
        }
        if (info.taskState === 'error') {
            return 'sharing-error'
        }
    }

    if (info.status === 'unshared') {
        if (info.taskState === 'running') {
            return 'unsharing'
        }
        if (info.taskState === 'success') {
            return 'unsharing-success'
        }
        if (info.taskState === 'error') {
            return 'unsharing-error'
        }
    }

    return 'not-shared-yet'
}

export function getShareAnnotationBtnAction({
    sharingAccess,
    sharingInfo,
    onUnshare,
    onShare,
}: SharingProps): React.MouseEventHandler {
    if (sharingAccess === 'feature-disabled') {
        return onShare
    }

    if (sharingAccess !== 'sharing-allowed') {
        return () => {}
    }

    const info = sharingInfo ?? {
        status: 'unshared',
        taskState: 'pristine',
    }

    if (
        info.status === 'unshared' &&
        (info.taskState === 'pristine' || info.taskState === 'success')
    ) {
        return onShare
    }
    if (
        info.status === 'shared' &&
        (info.taskState === 'pristine' || info.taskState === 'success')
    ) {
        return onUnshare
    }

    return () => {}
}
