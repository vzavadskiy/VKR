import * as React from 'react';
import { Box, FlexBox } from '../../../../components/react/ui/box';
import { styled } from '../../../../containers/styled-components';
import { t } from '../../../../locale';
import { useShallowEqualSelector } from '../../../../containers/redux-application';
import { useMemo } from 'react';
import { Loader } from '../../../../components/react/ui/loader';
import { StyledDynamicScrollableList } from '../../../../components/react/widgets-echd2/sidebar/sidebar-cameras/sidebar-cameras-list';
import type { IRadioInputProps } from '../../../../components/react/ui/ui-types';
import { createSelector } from 'reselect';
import {
    videoMosaicListItemsFilteredSelector,
    videoMosaicListSelector,
    videoMosaicPresetLayoutsConfigSelector,
} from '../../services/video-mosaic-list/video-mosaic-list-selector';
import { VideoMosaicListItem } from './video-mosaic-list-item';
import { VideoMosaicListToolbar } from './video-mosaic-list-toolbar';
import { videoMosaicWindowSelector } from '../../services/video-mosaic-window/video-mosaic-window-selector';

const VIDEO_MOSAIC_LIST_PANEL_WIDTH = 368;

const VideoMosaicListOuter = styled(FlexBox)<{ open: boolean | undefined }>`
    position: relative;
    height: 100%;
    flex-direction: column;
    width: ${VIDEO_MOSAIC_LIST_PANEL_WIDTH}px;
    ${p => {
        return `
            display: ${p.open ? 'flex' : 'none'};
            
      `;
    }}
`;

const listSelector = createSelector(
    videoMosaicListItemsFilteredSelector,
    videoMosaicListSelector,
    videoMosaicPresetLayoutsConfigSelector,
    s => videoMosaicWindowSelector(s).presetsListOpen,
    (items, list, layoutsConfig, presetsListOpen) => {
        return {
            list,
            items,
            layoutsConfig,
            presetsListOpen,
        };
    }
);

export const defaultSortingItems: ReadonlyArray<Omit<IRadioInputProps, 'onChange'>> = [
    {
        value: 'name.asc',
        name: t('video-mosaic.list.sorting.by-name.asc'),
    },
    {
        value: 'name.desc',
        name: t('video-mosaic.list.sorting.by-name.desc'),
    },
    {
        value: 'camerasCount.asc',
        name: t('video-mosaic.list.sorting.by-cameras-count.asc'),
    },
    {
        value: 'camerasCount.desc',
        name: t('video-mosaic.list.sorting.by-cameras-count.desc'),
    },
];

const VideoMosaicListComponent = () => {
    const {
        items,
        layoutsConfig,
        list: { searchText, selectedItemId, loading },
        presetsListOpen,
    } = useShallowEqualSelector(listSelector);

    const itemsRender = useMemo(
        () =>
            items.map((item, index) => {
                const config = layoutsConfig.find(_conf => _conf.id === item.layoutId);
                return (
                    <VideoMosaicListItem
                        {...item}
                        key={index}
                        searchText={searchText}
                        selectedItemId={selectedItemId}
                        config={config}
                    />
                );
            }),
        [items, searchText, selectedItemId, layoutsConfig]
    );
    const content = loading ? (
        <Loader align={'fit-all'} />
    ) : (
        <StyledDynamicScrollableList>{itemsRender}</StyledDynamicScrollableList>
    );
    return (
        <VideoMosaicListOuter open={presetsListOpen}>
            <VideoMosaicListToolbar />
            <Box flex="1" height="100%">
                {content}
            </Box>
        </VideoMosaicListOuter>
    );
};

export const VideoMosaicList = React.memo(VideoMosaicListComponent);
