import * as React from 'react';
import { styled } from '../../../../../containers/styled-components';
import { Box } from '../../../../../components/react/ui/box';
import {
    useApplicationAction,
    useDispatch,
    useSelector,
    useShallowEqualSelector,
} from '../../../../../containers/redux-application';
import {
    videoMosaicItemSelector,
    videoMosaicPresetLayoutConfigSelector,
} from '../../../services/video-mosaic-item/video-mosaic-item-selector';
import { VideoMosaicItemCamerasToolbar } from './video-mosaic-item-cameras-toolbar';
import { CameraItem } from '../../../../../components/react/widgets-echd2/sidebar/sidebar-cameras/camera-item';
import { useCallback, useEffect, useRef } from 'react';
import type { IListProps } from '../../../../../components/react/ui/list/list';
import { List } from '../../../../../components/react/ui/list/list';
import {
    videoMosaicCellsCamerasSelector,
    videoMosaicCellsFilterIsCustomSelector,
    videoMosaicCellsSelector,
} from '../../../services/video-mosaic-cells/video-mosaic-cells-selector';
import { getCameraById } from '../../../../../cameras/cameras-manager-helper';
import {
    VIDEO_MOSAIC_CAMERAS_LIST_DND_ID,
    VIDEO_MOSAIC_CELLS__REQUEST,
    VIDEO_MOSAIC_CELLS_CAMERA_REMOVE__CLICK,
    VIDEO_MOSAIC_CELLS_ITEMS_MOVE,
} from '../../../services/video-mosaic-cells/video-mosaic-cells-contants';
import { createSelector } from 'reselect';
import type { IApplicationState } from '../../../../../containers/application-state';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '../../../../../components/react/ui/button/button';
import { Trash } from '@netris/netris-icons';
import { alertDialog } from '../../../../../windows/flex-windows-manager-helpers';
import { t } from '../../../../../locale';
import { videoMosaicWindowSelector } from '../../../services/video-mosaic-window/video-mosaic-window-selector';
import type { IVideoMosaicCellsPosition } from '../../../services/video-mosaic-cells/video-mosaic-cells-types';
import type { DragItem } from '../video-mosaic-item-preset-cells';

const StyledList = styled(List)`
    height: 100%;
    max-height: 100%;
    overflow: hidden;
`;

export const videoMosaicActiveCamerasSelector = createSelector(
    (s: IApplicationState) => videoMosaicItemSelector(s).offset,
    s => videoMosaicCellsSelector(s).items,
    videoMosaicPresetLayoutConfigSelector,
    (offset, presetCellsItems, config) => {
        const limit = config?.cells?.length || 0;
        return presetCellsItems.slice(offset, offset + limit).map(_item => _item.cameraId);
    }
);

const VideoMosaicCamerasListItemOuter = styled(Box)<{ isActive: boolean }>`
    background-color: ${p => (p.isActive ? p.theme.inputs.itemList.oddBackground : 'inherit')};
    width: 100%;
    height: 100%;
`;

interface VideoMosaicCamerasListItemProps {
    readonly cameraId: number;
    readonly orderNumber: number;
}

const VideoMosaicCamerasListItem: React.FC<VideoMosaicCamerasListItemProps> = ({
    cameraId,
    orderNumber,
}) => {
    const dispatch = useDispatch();
    const { activeCameras, filterIsCustom, filterCameraName } = useShallowEqualSelector(s => ({
        activeCameras: videoMosaicActiveCamerasSelector(s),
        filterIsCustom: videoMosaicCellsFilterIsCustomSelector(s),
        filterCameraName: videoMosaicCellsSelector(s).filter.cameraName,
    }));

    const camera = getCameraById(cameraId);
    const dndRef = useRef<HTMLDivElement>(null);
    const [{ opacity }, drag, preview] = useDrag({
        item: {
            type: VIDEO_MOSAIC_CAMERAS_LIST_DND_ID,
            id: cameraId,
            order: orderNumber,
        },
        collect(monitor) {
            return {
                opacity: monitor.isDragging() ? 0.4 : 1,
            };
        },
        canDrag: () => true,
    });

    const [{ isActive }, drop] = useDrop({
        accept: VIDEO_MOSAIC_CAMERAS_LIST_DND_ID,
        canDrop: () => true,
        collect: monitor => ({
            isActive: monitor.isOver(),
        }),
        drop: async (item: DragItem, monitor) => {
            if (filterIsCustom) {
                await alertDialog(t('video-mosaic.cells.change.warning'));
                return;
            }
            const didDrop = monitor.didDrop();
            if (didDrop) return;
            dispatch({
                type: VIDEO_MOSAIC_CELLS_ITEMS_MOVE,
                from: item.order,
                to: orderNumber,
            });
        },
    });
    useEffect(() => {
        drag(drop(dndRef));
    });

    const onDelete = useCallback(async () => {
        if (filterIsCustom) {
            await alertDialog(t('video-mosaic.cells.change.warning'));
            return;
        }
        dispatch({
            type: VIDEO_MOSAIC_CELLS_CAMERA_REMOVE__CLICK,
            order: orderNumber,
        });
    }, [dispatch, orderNumber, filterIsCustom]);
    const actions = (
        <div>
            <Button
                buttonType="transparentBackground"
                floating={true}
                icon={Trash}
                onClick={onDelete}
                trainingIdentifier="video-mosaic-item-cameras-list__on-delete"
                tooltipKey="js.button.remove"
            />
        </div>
    );
    return (
        <VideoMosaicCamerasListItemOuter ref={preview} isActive={isActive} style={{ opacity }}>
            <div ref={dndRef}>
                <CameraItem
                    selected={activeCameras.includes(cameraId)}
                    dndRef={dndRef}
                    actionsRenderer={actions}
                    camera={camera}
                    textToHighlight={filterCameraName}
                />
            </div>
        </VideoMosaicCamerasListItemOuter>
    );
};

const VideoMosaicCamerasList = () => {
    const {
        cellsCameras,
        cells: {
            lazyLoadingConfig: { isListLoaded },
            loading,
        },
    } = useShallowEqualSelector(s => ({
        cellsCameras: videoMosaicCellsCamerasSelector(s),
        cells: videoMosaicCellsSelector(s),
        item: videoMosaicItemSelector(s),
    }));
    const itemRenderer: IListProps<IVideoMosaicCellsPosition>['itemRenderer'] = useCallback(
        ({ item, index }: { item: IVideoMosaicCellsPosition; index: number }) => {
            return (
                <VideoMosaicCamerasListItem
                    key={index}
                    cameraId={item.cameraId as number}
                    orderNumber={item.orderNumber}
                />
            );
        },
        []
    );

    const loadMore = useApplicationAction({ type: VIDEO_MOSAIC_CELLS__REQUEST });

    return (
        <StyledList
            items={cellsCameras}
            itemRenderer={itemRenderer}
            isLoaded={isListLoaded}
            isLoading={loading}
            onScrollEnd={loadMore}
        />
    );
};

const VIDEO_MOSAIC_CAMERAS_LIST_PANEL_WIDTH = 368;

const VideoMosaicItemCamerasOuter = styled(Box)<{ open: boolean | undefined }>`
    display: ${p => (p.open ? 'flex' : 'none')};
    flex-direction: column;
    width: ${VIDEO_MOSAIC_CAMERAS_LIST_PANEL_WIDTH}px;
`;

export const VideoMosaicItemCameras = () => {
    const camerasListOpen = useSelector(s => videoMosaicWindowSelector(s).camerasListOpen);
    return (
        <VideoMosaicItemCamerasOuter open={camerasListOpen}>
            <VideoMosaicItemCamerasToolbar />
            <VideoMosaicCamerasList />
        </VideoMosaicItemCamerasOuter>
    );
};
