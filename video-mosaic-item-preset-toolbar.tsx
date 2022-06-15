import React, { useMemo, useState } from 'react';
import { AlertCircle, Search, HistoryBack, VolumeX, Image, Repeat } from '@netris/netris-icons';
import { SwitchInput } from '@netris/components/inputs/switch/switch-input';
import { ActionsMenu } from '@netris/components/complex/actions-menu/actions-menu';
import { Text } from '@netris/components/base/typography/typography';

import { Box, FlexBox } from '@netris/components/base/box/box';
import { styled } from '../../../../containers/styled-components';
import { Button } from '@netris/components/base/button/button';
import { t } from '../../../../locale';
import {
    useApplicationAction,
    useShallowEqualSelector,
} from '../../../../containers/redux-application';
import { videoMosaicPresetLayoutsConfigSortingSelector } from '../../services/video-mosaic-list/video-mosaic-list-selector';
import { VideoMosaicPresetIcon } from '../video-mosaic-preset-icon';
import { ActionsMenuItem } from '../../../../components/react/ui/actions/actions-menu-item';
import type { IVideoMosaicPresetLayoutConfig } from '../../services/video-mosaic-helpers';
import {
    videoMosaicItemPresetSelector,
    videoMosaicItemSelector,
    videoMosaicPresetLayoutConfigSelector,
} from '../../services/video-mosaic-item/video-mosaic-item-selector';
import {
    VIDEO_MOSAIC_INFO_ABOUT_CAMERAS_FORM_ID,
    VIDEO_MOSAIC_ITEM_ARCHIVE_MODE__CHANGE,
    VIDEO_MOSAIC_PRESET_FORM_ID,
} from '../../services/video-mosaic-item/video-mosaic-item-constants';
import { VideoMosaicItemPresetRotationControls } from './video-mosaic-item-preset-rotation-controls';
import type { IApplicationState } from '../../../../containers/application-state';
import { useForm, useFormFieldValue } from '../../../../services/forms/forms-hooks';
import { CheckboxInput } from '@netris/components/inputs/checkbox/checkbox-input';
import { Dropdown } from '@netris/components/containers/dropdown/dropdown';
import { videoMosaicWindowSelector } from '../../services/video-mosaic-window/video-mosaic-window-selector';
import { VIDEO_MOSAIC_WINDOW_CAMERAS_LIST_TOGGLE__CLICK } from '../../services/video-mosaic-window/video-mosaic-window-constants';
import { useSystemSetting } from '../../../../containers/application-utils-react';
import { HelpIconOuter, SwitchInputWrapper } from './video-mosaic-item-preset-toolbar-styled';
import { Tooltip } from '../../../../components/react/ui/tooltip';

const VideoMosaicItemPresetToolbarOuter = styled(FlexBox)<{ show: boolean }>`
    display: ${p => (p.show ? 'flex' : 'none')};
    align-items: center;
    justify-content: space-between;
    border-left: 1px solid ${p => p.theme.delimiter.color};
    border-right: 1px solid ${p => p.theme.delimiter.color};
`;

const presetToolbarLayoutsMenuSelector = (s: IApplicationState) => {
    return {
        preset: videoMosaicItemPresetSelector(s),
        currentConfig: videoMosaicPresetLayoutConfigSelector(s),
        layoutsConfig: videoMosaicPresetLayoutsConfigSortingSelector(s),
    };
};
interface IPresetToolbarLayoutsItemProps {
    readonly config: IVideoMosaicPresetLayoutConfig;
    readonly presetLayoutId: number | undefined;
}
export const PresetToolbarLayoutsItem: React.FC<IPresetToolbarLayoutsItemProps> = ({
    config,
    presetLayoutId,
}) => {
    const { onChange: onLayoutIdChange } = useFormFieldValue(
        VIDEO_MOSAIC_PRESET_FORM_ID,
        'layoutId',
        'text'
    );

    const onChangeLayout = () => {
        onLayoutIdChange?.(config.id, 'layoutId', undefined);
    };
    const icon = () => <VideoMosaicPresetIcon size={20} config={config} />;
    return (
        <ActionsMenuItem
            key={config.id}
            buttonType="secondary"
            title={config.name}
            icon={icon}
            toggled={presetLayoutId === config.id}
            onClick={onChangeLayout}
        />
    );
};

export const PresetToolbarLayoutsMenu = () => {
    const { currentConfig, layoutsConfig, preset } = useShallowEqualSelector(
        presetToolbarLayoutsMenuSelector
    );

    const itemsRenderer = useMemo(() => {
        return layoutsConfig.map(config => (
            <PresetToolbarLayoutsItem
                key={config.id}
                config={config}
                presetLayoutId={preset.layoutId}
            />
        ));
    }, [layoutsConfig, preset.layoutId]);
    const actionsMenuToggle = () => (
        <Button
            padding={0}
            trainingIdentifier="video-mosaic-item-preset-toolbar__actions-menu-toggle"
            tooltipKey="video-mosaic.item.grid-type.hint"
        >
            <VideoMosaicPresetIcon size={16} config={currentConfig} />
        </Button>
    );
    if (currentConfig) {
        return (
            <ActionsMenu
                hoverable={false}
                toggle={actionsMenuToggle}
                mr={2}
                trainingIdentifier="video-mosaic-item-preset-toolbar__actions-menu"
            >
                {itemsRenderer}
            </ActionsMenu>
        );
    } else return null;
};
const videoMosaicItemPresetToolbarSelector = (s: IApplicationState) => ({
    preset: videoMosaicItemPresetSelector(s),
    camerasListOpen: videoMosaicWindowSelector(s).camerasListOpen,
    archiveMode: videoMosaicItemSelector(s).archiveMode,
    config: videoMosaicPresetLayoutConfigSelector(s),
});

const fieldsInfo = ['isShortName', 'isDescription', 'isAddress', 'isTypeName'] as const;
const Info = () => {
    const { getInputProps } = useForm(VIDEO_MOSAIC_INFO_ABOUT_CAMERAS_FORM_ID, { dependency: 1 });
    const localizedNames = [
        t('video-mosaic.camera.info.short-name'),
        t('video-mosaic.camera.info.description'),
        t('video-mosaic.camera.info.address'),
        t('video-mosaic.camera.info.type-name'),
    ];
    return (
        <FlexBox p={2} flexDirection="column">
            <Text renderTag="p" size="large">
                {t('video-mosaic.camera.info-window.title')}
            </Text>
            <Box mt={1}>
                {fieldsInfo.map((item, index) => (
                    <FlexBox key={item} alignItems="center" pt={1} pb={1}>
                        <CheckboxInput {...getInputProps(item, 'checkbox')} m={0} />
                        <Text renderTag="p" size="regular">
                            {localizedNames[index]}
                        </Text>
                    </FlexBox>
                ))}
                <hr />
                <FlexBox alignItems="center" pt={1}>
                    <CheckboxInput {...getInputProps('isHover', 'checkbox')} m={0} />
                    <Text renderTag="p" size="regular">
                        {t('video-mosaic.camera.info.show')}
                    </Text>
                </FlexBox>
                <FlexBox alignItems="center" pt={1}>
                    <CheckboxInput {...getInputProps('isTicker', 'checkbox')} m={0} />
                    <Text renderTag="p" size="regular">
                        {t('video-mosaic.camera.info.ticker')}
                    </Text>
                </FlexBox>
            </Box>
        </FlexBox>
    );
};

export const VideoMosaicItemPresetToolbar: React.FC<{ show: boolean }> = ({ show }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { preset, camerasListOpen, archiveMode, config } = useShallowEqualSelector(
        videoMosaicItemPresetToolbarSelector
    );
    const onCamerasPanelToggle = useApplicationAction({
        type: VIDEO_MOSAIC_WINDOW_CAMERAS_LIST_TOGGLE__CLICK,
    });
    const {
        onChange: onUseCameraPositionsChange,
        checked: useCameraPositionsValue,
    } = useFormFieldValue(VIDEO_MOSAIC_PRESET_FORM_ID, 'useCameraPositions', 'checkbox');
    const onSwitchUseCameraPositionsChange = (value: boolean) => {
        onUseCameraPositionsChange?.(value);
    };
    const onArchiveToggle = useApplicationAction({
        type: VIDEO_MOSAIC_ITEM_ARCHIVE_MODE__CHANGE,
        archiveMode: !archiveMode,
    });

    const MW_PORTAL_PRESETS_MAX_ALLOWED_ARCHIVES = useSystemSetting(
        'MW_PORTAL_PRESETS_MAX_ALLOWED_ARCHIVES'
    );
    const isArchiveEnable = (config?.cells.length || 0) <= MW_PORTAL_PRESETS_MAX_ALLOWED_ARCHIVES;
    if (!preset.layoutId) {
        return null;
    }
    return (
        <VideoMosaicItemPresetToolbarOuter show={show} p={2}>
            <FlexBox>
                <PresetToolbarLayoutsMenu />
                <SwitchInputWrapper mr={2} show={!archiveMode}>
                    <SwitchInput
                        labelPosition="right"
                        checked={useCameraPositionsValue}
                        label={<Text>{t('video-mosaic.consider.camera.positions')}</Text>}
                        onChange={onSwitchUseCameraPositionsChange}
                    />

                    <HelpIconOuter>
                        <Tooltip tooltipKey={'video-mosaic.consider.camera.positions.help'} />!
                    </HelpIconOuter>
                </SwitchInputWrapper>
            </FlexBox>
            <FlexBox>
                <Dropdown
                    preferredPosition={'br'}
                    contentRenderer={() => <Info />}
                    close={() => setIsOpen(false)}
                    open={() => setIsOpen(true)}
                    isOpen={isOpen}
                    trainingIdentifier="video-mosaic-item-preset-toolbar__dropdown"
                >
                    <Button
                        toggled={isOpen}
                        mr={2}
                        icon={AlertCircle}
                        trainingIdentifier="video-mosaic-item-preset-toolbar__alert-circle"
                        tooltipKey="video-mosaic.item-preset-toolbar.info"
                    />
                </Dropdown>
                {isArchiveEnable ? (
                    <Button
                        mr={2}
                        icon={HistoryBack}
                        toggled={archiveMode}
                        onClick={onArchiveToggle}
                        tooltipKey="video-mosaic.item.archive.toggle.btn"
                        trainingIdentifier="video-mosaic-item-preset-toolbar__history-back"
                    />
                ) : null}
                <Button
                    mr={2}
                    icon={VolumeX}
                    trainingIdentifier="video-mosaic-item-preset-toolbar__volume-x"
                    tooltipKey="video-mosaic.item-preset-toolbar.player-mute"
                />
                <Button
                    mr={2}
                    icon={Image}
                    trainingIdentifier="video-mosaic-item-preset-toolbar__image"
                    tooltipKey="video-mosaic.item-preset-toolbar.snapshots.mode"
                />
                <Button
                    mr={2}
                    icon={Repeat}
                    trainingIdentifier="video-mosaic-item-preset-toolbar__repeat"
                    tooltipKey="video-mosaic.item-preset-toolbar.reload"
                />
            </FlexBox>
            <FlexBox>
                <VideoMosaicItemPresetRotationControls />
                {camerasListOpen ? null : (
                    <Button
                        ml={2}
                        icon={Search}
                        onClick={onCamerasPanelToggle}
                        trainingIdentifier="video-mosaic-item-preset-toolbar__search"
                    />
                )}
            </FlexBox>
        </VideoMosaicItemPresetToolbarOuter>
    );
};
