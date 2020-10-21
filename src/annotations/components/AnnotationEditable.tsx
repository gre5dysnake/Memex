import * as React from 'react'
import styled, { ThemeProvider } from 'styled-components'

import niceTime from 'src/util/nice-time'
import { AnnotationMode } from 'src/sidebar/annotations-sidebar/types'
// import { CrowdfundingBox } from 'src/common-ui/crowdfunding'
import AnnotationView from 'src/annotations/components/AnnotationView'
import AnnotationFooter, {
    AnnotationFooterEventProps,
} from 'src/annotations/components/AnnotationFooter'
import AnnotationEdit, {
    AnnotationEditGeneralProps,
    AnnotationEditEventProps,
} from 'src/annotations/components/AnnotationEdit'
import TextTruncated from 'src/annotations/components/parts/TextTruncated'
import { GenericPickerDependenciesMinusSave } from 'src/common-ui/GenericPicker/logic'
import { SidebarAnnotationTheme } from '../types'
import {
    AnnotationSharingInfo,
    AnnotationSharingAccess,
} from 'src/content-sharing/ui/types'

export interface AnnotationEditableGeneralProps {}

export interface AnnotationEditableProps {
    /** Required to decide how to go to an annotation when it's clicked. */
    url: string
    sharingInfo: AnnotationSharingInfo
    sharingAccess: AnnotationSharingAccess
    className?: string
    isActive?: boolean
    isHovered?: boolean
    isClickable?: boolean
    createdWhen: Date
    lastEdited: Date
    body?: string
    comment?: string
    tags: string[]
    hasBookmark?: boolean
    mode: AnnotationMode
    tagPickerDependencies: GenericPickerDependenciesMinusSave
    annotationFooterDependencies: AnnotationFooterEventProps
    annotationEditDependencies: AnnotationEditGeneralProps &
        AnnotationEditEventProps
    renderCopyPasterForAnnotation: (id: string) => JSX.Element
    renderShareMenuForAnnotation: (id: string) => JSX.Element
}

export interface AnnotationEditableEventProps {
    onGoToAnnotation: (url: string) => void
    onMouseEnter?: (url: string) => void
    onMouseLeave?: (url: string) => void
}

export type Props = AnnotationEditableGeneralProps &
    AnnotationEditableProps &
    AnnotationEditableEventProps

export default class AnnotationEditable extends React.Component<Props> {
    private annotEditRef = React.createRef<AnnotationEdit>()
    private boxRef: HTMLDivElement = null
    private removeEventListeners?: () => void

    static defaultProps: Partial<Props> = {
        mode: 'default',
    }

    componentDidMount() {
        this.setupEventListeners()
    }

    componentWillUnmount() {
        if (this.boxRef && this.removeEventListeners) {
            this.removeEventListeners()
        }
    }

    focus() {
        this.annotEditRef?.current?.focus()
    }

    private get isEdited(): boolean {
        return (
            this.props.lastEdited &&
            this.props.lastEdited !== this.props.createdWhen
        )
    }

    private get theme(): SidebarAnnotationTheme {
        return {
            cursor: this.props.isClickable ? 'pointer' : 'auto',
            hasComment: this.props.comment?.length > 0,
            hasHighlight: this.props.body?.length > 0,
            isActive: this.props.isActive,
            isEditing: this.props.mode === 'edit',
        }
    }

    private setupEventListeners = () => {
        if (this.boxRef) {
            const handleMouseEnter = () =>
                this.props.onMouseEnter(this.props.url)
            const handleMouseLeave = () =>
                this.props.onMouseLeave(this.props.url)

            this.boxRef.addEventListener('mouseenter', handleMouseEnter)
            this.boxRef.addEventListener('mouseleave', handleMouseLeave)

            this.removeEventListeners = () => {
                this.boxRef.removeEventListener('mouseenter', handleMouseEnter)
                this.boxRef.removeEventListener('mouseleave', handleMouseLeave)
            }
        }
    }

    private setBoxRef = (ref: HTMLDivElement) => {
        this.boxRef = ref
    }

    private getFormattedTimestamp = () =>
        niceTime(this.props.lastEdited ?? this.props.createdWhen)

    private handleGoToAnnotation = () => {
        if (!this.props.isClickable) {
            return
        }

        this.props.onGoToAnnotation(this.props.url)
    }

    private renderHighlightBody() {
        if (!this.props.body) {
            return
        }

        return (
            <HighlightStyled>
                <TextTruncated isHighlight={true} text={this.props.body} />
            </HighlightStyled>
        )
    }

    private renderFooter() {
        const {
            annotationFooterDependencies,
            annotationEditDependencies,
            onGoToAnnotation,
            ...props
        } = this.props

        return (
            <AnnotationFooter
                {...props}
                {...annotationFooterDependencies}
                isEdited={this.isEdited}
                timestamp={this.getFormattedTimestamp()}
                togglePreview={() =>
                    annotationEditDependencies.setEditPreview(
                        !annotationEditDependencies.showPreview,
                    )
                }
            />
        )
    }

    private renderMainAnnotation() {
        const {
            mode,
            annotationEditDependencies,
            annotationFooterDependencies,
            tagPickerDependencies,
        } = this.props

        if (annotationEditDependencies.showPreview) {
            return (
                <AnnotationView
                    previewMode
                    theme={this.theme}
                    tags={annotationEditDependencies.tags}
                    comment={annotationEditDependencies.comment}
                    onEditIconClick={
                        annotationFooterDependencies.onEditIconClick
                    }
                />
            )
        }

        if (mode === 'edit') {
            return (
                <AnnotationEdit
                    ref={this.annotEditRef}
                    {...this.props}
                    {...annotationEditDependencies}
                    tagPickerDependencies={tagPickerDependencies}
                    rows={2}
                />
            )
        }

        return (
            <AnnotationView
                {...this.props}
                theme={this.theme}
                onEditIconClick={annotationFooterDependencies.onEditIconClick}
            />
        )
    }

    private renderShareMenu() {
        return (
            <ShareMenuWrapper>
                {this.props.renderShareMenuForAnnotation(this.props.url)}
            </ShareMenuWrapper>
        )
    }

    private renderCopyPaster() {
        return (
            <CopyPasterWrapper>
                {this.props.renderCopyPasterForAnnotation(this.props.url)}
            </CopyPasterWrapper>
        )
    }

    render() {
        return (
            <ThemeProvider theme={this.theme}>
                <AnnotationStyled
                    id={this.props.url} // Focusing on annotation relies on this ID.
                    ref={this.setBoxRef}
                    onClick={this.handleGoToAnnotation}
                >
                    {this.renderHighlightBody()}
                    {this.renderMainAnnotation()}
                    {this.renderFooter()}
                    {this.renderCopyPaster()}
                    {this.renderShareMenu()}
                </AnnotationStyled>
            </ThemeProvider>
        )
    }
}

const ShareMenuWrapper = styled.div`
    position: relative;
`
const CopyPasterWrapper = styled.div`
    position: relative;
    left: 70px;
`

const HighlightTextStyled = styled.span``

const HighlightStyled = styled.div`
    font-weight: 400;
    font-size: 14px;
    letter-spacing: 0.5px;
    margin: 0 0 5px 0;
    padding: 15px 15px 7px 15px;
    line-height: 20px;
    text-align: left;
`

const AnnotationStyled = styled.div`
    border-radius: 3px;

    color: rgb(54, 54, 46);

    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px,
        rgba(15, 15, 15, 0.1) 0px 2px 4px;
    transition: background 120ms ease-in 0s;

    &:hover {
        transition: background 120ms ease-in 0s;
        background-color: rgba(55, 53, 47, 0.03);
    }

    box-sizing: border-box;
    width: 97%;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    margin: 10px 0 5px 0;
    cursor: pointer;
    animation: onload 0.3s cubic-bezier(0.65, 0.05, 0.36, 1);

    ${({ theme }) =>
        theme.isActive &&
        `
        box-shadow: 0px 0px 5px 1px #00000080;
    `}

    cursor: ${({ theme }) => theme.cursor}

    ${({ theme }) =>
        theme.isEditing &&
        `
        background-color: white;
        cursor: default;

        &:hover {
            background-color: white;
        }
    `}
`
