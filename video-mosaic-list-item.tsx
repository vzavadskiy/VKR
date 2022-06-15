import * as React from 'react';
import { Box, FlexBox } from '../../../../components/react/ui/box';
import { HighlightedHtmlText } from '@netris/components/base/higtlighted-html-text/higtlighted-html-text';
import { Text } from '../../../../components/react/ui/typography';
import { styled } from '../../../../containers/styled-components';
import { MoreVertical, Trash, Share2, Crowd, Eye, Users } from '@netris/netris-icons';
import { Button } from '../../../../components/react/ui/button/button';
import { ActionsMenu } from '../../../../components/react/ui/actions/actions-menu';
import { ActionsMenuItem } from '../../../../components/react/ui/actions/actions-menu-item';
import { format, t } from '../../../../locale';
import { confirmDialog } from '../../../../windows/flex-windows-manager-helpers';
import {
    useApplicationAction,
    useDispatch,
    useSelector,
} from '../../../../containers/redux-application';
import { VideoMosaicPresetIcon } from '../video-mosaic-preset-icon';
import type { IVideoMosaicPresetLayoutConfig } from '../../services/video-mosaic-helpers';
import {
    VIDEO_MOSAIC_LIST_ITEM_SELECT,
    VIDEO_MOSAIC_LIST_ITEM__DELETE_CLICK,
    VIDEO_MOSAIC_ITEM__TOGGLE_CHECKED,
} from '../../services/video-mosaic-list/video-mosaic-list-constants';
import type { IVideoMosaicItemPreset } from '../../services/video-mosaic-item/video-mosaic-item-types';
import { ListItemMixIn } from '../../../../components/react/widgets-echd2/sidebar/sidebar-cameras/camera-item';
import { CheckboxInput } from '@netris/components/inputs/checkbox/checkbox-input';
import {
    VIDEO_MOSAIC_SHARE_MODE_EDIT,
    VIDEO_MOSAIC_SHARE_MODE_VIEW,
    VIDEO_MOSAIC_SHARE_SETTINGS__CLICK,
} from '../../services/video-mosaic-share/video-mosaic-share-constants';
import { useOpenShareWindow } from '../video-mosaic-item/video-mosaic-item-preset-helper';
import { userLoginSelector } from '../../../../shared/get-user-id';
import { Tooltip } from '@netris/components/base/floating-tooltip/floating-tooltip';

const VideoMosaicListItemOuter = styled(FlexBox)<{ selected: boolean }>`
    ${ListItemMixIn}
`;

const sharedModeMap = {
    [VIDEO_MOSAIC_SHARE_MODE_VIEW]: { icon: Eye, iconTooltipKey: 'video-mosaic.share.mode.view' },
    [VIDEO_MOSAIC_SHARE_MODE_EDIT]: { icon: Users, iconTooltipKey: 'video-mosaic.share.mode.edit' },
};

const IconWrapper = styled(Text)`
    margin-left: ${p => p.theme.inputs.inputGroup.marginLeft};
`;

interface IVideoMosaicListItemProps extends IVideoMosaicItemPreset {
    readonly searchText: string;
    readonly selectedItemId: string | undefined;
    readonly config: IVideoMosaicPresetLayoutConfig | undefined;
}

export const VideoMosaicListItem: React.FC<IVideoMosaicListItemProps> = ({
    name,
    camerasCount,
    searchText,
    id,
    selectedItemId,
    config,
    owner,
    presetSharings,
}) => {
    const dispatch = useDispatch();
    const checked = useSelector(
        s => s.videoMosaic?.list.selectedItems.includes(id as string) ?? false
    );
    const actionsMenuToggle = ({ floating }: { floating: boolean }) => (
        <Button
            floating={floating}
            buttonType="transparentBackground"
            icon={MoreVertical}
            trainingIdentifier="video-mosaic-list-item__action-menu-toggle"
        />
    );
    const currentUserName = useSelector(userLoginSelector);
    const isOwnerCurrentPreset = currentUserName === owner;
    const shareType = presetSharings.find(share => share.username === currentUserName)
        ?.shareMode as keyof typeof sharedModeMap;
    const SharedModeIcon = sharedModeMap[shareType]?.icon;
    const sharedModeIconTooltipKey = sharedModeMap[shareType]?.iconTooltipKey;
    const canEdit = shareType !== VIDEO_MOSAIC_SHARE_MODE_VIEW;
    const onDelete = async (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const confirmText = format('video-mosaic.item.action.delete.confirm-text', { name });
        const confirmed = await confirmDialog(confirmText, {
            okText: t('video-mosaic.item.action.delete.confirm-button'),
            header: t('video-mosaic.item.action.delete.confirm-header'),
            danger: true,
        });
        if (confirmed) {
            dispatch({
                type: VIDEO_MOSAIC_LIST_ITEM__DELETE_CLICK,
                id: id as string,
                name,
            });
        }
    };

    const onItemClick = () => {
        if (selectedItemId !== id) {
            dispatch({
                type: VIDEO_MOSAIC_LIST_ITEM_SELECT,
                id,
            });
        }
    };

    const onClickStopPropagation = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

    const onChange = useApplicationAction({
        type: VIDEO_MOSAIC_ITEM__TOGGLE_CHECKED,
        id: id as string,
        checked: !checked,
    });

    const onShareClick = useOpenShareWindow(name, id as string);
    const onShareSettingsClick = useApplicationAction({
        type: VIDEO_MOSAIC_SHARE_SETTINGS__CLICK,
        id: id as string,
    });

    return (
        <VideoMosaicListItemOuter
            pl={2}
            pr={1}
            pt={1}
            pb={1}
            onClick={onItemClick}
            selected={id === selectedItemId}
        >
            <VideoMosaicPresetIcon size={24} config={config} />
            <Box flex="1" pl={1} pr={1}>
                <Box height="100%" pb={1}>
                    <HighlightedHtmlText nowrap={false} text={name} textToHighlight={searchText} />
                </Box>
                <FlexBox>
                    <Text size="micro" color={id ? 'secondary' : 'warning'}>
                        {format('video-mosaic.item.cameras.total', {
                            total: camerasCount,
                        })}
                    </Text>
                    {isOwnerCurrentPreset && presetSharings.length > 0 && (
                        <IconWrapper color="secondary">
                            <Tooltip tooltipKey="video-mosaic.share.shared" />
                            <Share2 size={18} />
                        </IconWrapper>
                    )}
                    {!isOwnerCurrentPreset && presetSharings.length > 0 && (
                        <IconWrapper color="secondary">
                            <Tooltip tooltipKey={sharedModeIconTooltipKey} />
                            <SharedModeIcon size={18} />
                        </IconWrapper>
                    )}
                </FlexBox>
            </Box>
            <Box onClick={onClickStopPropagation} display="flex" alignItems="center">
                <CheckboxInput mb={0} checked={checked} onChange={onChange} />
                <ActionsMenu
                    toggle={actionsMenuToggle}
                    floating={true}
                    mr={1}
                    trainingIdentifier="video-mosaic-list-item__actions-menu-actions"
                >
                    {canEdit && (
                        <ActionsMenuItem
                            title={t('video-mosaic.item.action.share')}
                            icon={Share2}
                            onClick={onShareClick}
                        />
                    )}
                    {canEdit && (
                        <ActionsMenuItem
                            title={t('video-mosaic.item.action.access')}
                            icon={Crowd}
                            onClick={onShareSettingsClick}
                        />
                    )}
                    <ActionsMenuItem
                        title={t('video-mosaic.item.action.delete')}
                        icon={Trash}
                        onClick={onDelete}
                    />
                </ActionsMenu>
            </Box>
        </VideoMosaicListItemOuter>
    );
};
