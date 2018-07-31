import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import localStyles from './Tooltip.css'

const mainTooltipContainer = (showTooltip, scrollDisabled) =>
    classNames({
        [localStyles.mainTooltip]: true,
        [localStyles.isActive]: showTooltip,
        [localStyles.counterMargin]: scrollDisabled,
    })

const tooltipButton = showTooltip =>
    classNames({
        [localStyles.tooltipButtonIcon]: showTooltip,
    })

const Tooltip = ({
    showTooltip,
    toggleShowTooltip,
    tooltip,
    fetchNextTooltip,
    isTooltipRenderable,
    scrollDisabled,
}) => (
    <div className={mainTooltipContainer(showTooltip, scrollDisabled)}>
        <div className={localStyles.tooltipButton}>
            <div
                className={tooltipButton(showTooltip)}
                onClick={toggleShowTooltip}
            >
                {!showTooltip && 'Show Tips'}
            </div>
            {showTooltip && (
                <div
                    className={localStyles.refreshIcon}
                    onClick={fetchNextTooltip}
                    title="Next Tip"
                />
            )}
        </div>
        {isTooltipRenderable && (
            <div className={localStyles.tooltipText}>
                <div className={localStyles.tooltipTitle}>{tooltip.title}</div>
                <div
                    className={localStyles.tooltipDesc}
                    dangerouslySetInnerHTML={{
                        __html: tooltip.description,
                    }}
                />
            </div>
        )}
    </div>
)

Tooltip.propTypes = {
    showTooltip: PropTypes.bool.isRequired,
    scrollDisabled: PropTypes.bool.isRequired,
    toggleShowTooltip: PropTypes.func.isRequired,
    tooltip: PropTypes.object,
    fetchNextTooltip: PropTypes.func.isRequired,
    isTooltipRenderable: PropTypes.bool.isRequired,
}

export default Tooltip
