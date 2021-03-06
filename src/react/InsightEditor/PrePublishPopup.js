import React from 'react'
import Button from '@santiment-network/ui/Button'
import Panel from '@santiment-network/ui/Panel/Panel'
import IconArrowUp from '@santiment-network/ui/Icon/IconArrowUp'
import ContextMenu from '@santiment-network/ui/ContextMenu'
import ProInsightToggle from './ProInsightToggle'
import TagSelector from '../TagSelector'
import styles from './PrePublishPopup.module.scss'

const PrePublishPopup = ({
  onPublishClick,
  defaultTags = [],
  onTagsChange,
  isLoading,
  actionTargetLabel,
  isPaywallRequired,
  togglePaywallRequired,
  isPro,
  isPulse,
}) => {
  return (
    <ContextMenu
      align='end'
      trigger={
        <Button accent='positive' border>
          {actionTargetLabel} insight
          {React.cloneElement(IconArrowUp, { className: styles.icon })}
        </Button>
      }
    >
      <Panel padding className={styles.wrapper}>
        <p className={styles.paragraph}>Add tags to catch more attention.</p>
        <p className={styles.paragraph}>
          The first tag determines the insight’s preview image, featured on the
          main feed.
        </p>
        <div className={styles.label}>
          <span className={styles.bold}>Tags</span>({defaultTags.length}/5)
        </div>
        <TagSelector onChange={onTagsChange} defaultTags={defaultTags} />

        <ProInsightToggle
          isPulse={isPulse}
          isPro={isPro}
          togglePaywallRequired={togglePaywallRequired}
          isPaywallRequired={isPaywallRequired}
        />

        <Button
          variant='fill'
          accent='positive'
          className={styles.button}
          onClick={onPublishClick}
          isLoading={isLoading}
        >
          {actionTargetLabel} insight
        </Button>
      </Panel>
    </ContextMenu>
  )
}

export default PrePublishPopup
