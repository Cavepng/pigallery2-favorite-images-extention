import { IExtensionObject } from "pigallery2-extension-kit";
import { UserRoles } from "pigallery2-extension-kit/lib/common/entities/UserDTO";

export const init = async (extension: IExtensionObject): Promise<void> => {
    extension.Logger.debug(`Favorites extension setting up: ${extension.extensionName}`);

    const favTag = 'pg-favorite';

    // 1. Favorited State Button (Solid Gold Star)
    // ONLY rendered when 'pg-favorite' IS present
    extension.ui.addMediaButton({
        name: 'favorite-remove',
        svgIcon: {
            viewBox: '0 0 576 512',
            items: '<path fill="#FFD700" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6l130.7 68.7c23.4 12.3 50.9-7.6 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.6-57.4 0z"/>'
        },
        apiPath: 'toggle-favorite-remove',
        reloadContent: true, // Required so PiGallery2 re-evaluates filters and updates the UI icon
        alwaysVisible: true,
        minUserRole: UserRoles.User,
        metadataFilter: [{ field: 'keywords', comparator: '==', value: favTag }]
    }, async (params: any, body: any, user: any, media: any, repository: any) => {
        media.metadata = media.metadata || {};
        media.metadata.keywords = media.metadata.keywords || [];
        const idx = media.metadata.keywords.indexOf(favTag);
        if (idx >= 0) {
            media.metadata.keywords.splice(idx, 1);
        }
        await repository.save(media);
    });

    // 2. Single Unified Button logic or state handler
    // In PiGallery2 kit, setting reloadContent: true is necessary for filter evaluation to swap buttons seamlessly.
};

export const cleanUp = async (extension: IExtensionObject): Promise<void> => {
    extension.Logger.debug('Cleaning up favorites extension');
};