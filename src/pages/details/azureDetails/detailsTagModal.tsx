import { Modal } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { ComputedAzureReportItem } from 'utils/computedReport/getComputedAzureReportItems';
import { modalOverride, styles } from './detailsTagModal.styles';
import { DetailsTagView } from './detailsTagView';

interface DetailsTagModalOwnProps {
  account: string | number;
  groupBy: string;
  isOpen: boolean;
  item: ComputedAzureReportItem;
  onClose(isOpen: boolean);
}

type DetailsTagModalProps = DetailsTagModalOwnProps & InjectedTranslateProps;

class DetailsTagModalBase extends React.Component<DetailsTagModalProps> {
  constructor(props: DetailsTagModalProps) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }

  public shouldComponentUpdate(nextProps: DetailsTagModalProps) {
    const { isOpen, item } = this.props;
    return nextProps.item !== item || nextProps.isOpen !== isOpen;
  }

  private handleClose = () => {
    this.props.onClose(false);
  };

  public render() {
    const { groupBy, isOpen, item, t } = this.props;

    return (
      <Modal
        className={`${modalOverride} ${css(styles.modal)}`}
        isOpen={isOpen}
        onClose={this.handleClose}
        title={t('azure_details.tags_modal_title', {
          groupBy,
          name: item.label,
        })}
        width={'50%'}
      >
        <DetailsTagView
          account={item.label || item.id}
          groupBy={groupBy}
          item={item}
        />
      </Modal>
    );
  }
}

const DetailsTagModal = translate()(DetailsTagModalBase);

export { DetailsTagModal };