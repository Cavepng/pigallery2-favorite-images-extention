"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.init = void 0;
const UserDTO_1 = require("./node_modules/pigallery2-extension-kit/lib/common/entities/UserDTO");
const init = async (extension) => {
    extension.Logger.debug(`Favorites extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`);
    // Add CSS injection or style handling if needed, and the favorite toggle button
    extension.ui.addMediaButton({
        name: 'favorite',
        svgIcon: {
            viewBox: '0 0 576 512',
            items: '<path fill="currentColor" d="M528.1 171.5L382 150.2 316.7 17c-11.7-23.6-45.6-23.6-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6l130.7 68.7c23.4 12.3 50.9-7.6 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4-124.3-65.4c-9.3-4.9-20.5-4.9-29.8 0L163.7 450.7l23.7-138.4c1.8-10.5-2.6-21.2-11.2-27.2L55.6 210.9l139.8-20.3c10.9-1.6 20.2-8.5 24.9-18.5L288 61.5l68.7 110.6c4.7 10 14 16.9 24.9 18.5l139.8 20.3-122.9 74.2c-8.6 6-13 16.7-11.2 27.2z"/>'
        },
        apiPath: 'toggle-favorite',
        reloadContent: true,
        alwaysVisible: true,
        minUserRole: UserDTO_1.UserRoles.User,
        metadataFilter: [{ field: 'keywords', comparator: '==', value: 'pg-favorite' }]
    }, async (params, body, user, media, repository) => {
        const favTag = 'pg-favorite';
        media.metadata.keywords = media.metadata.keywords || [];
        const idx = media.metadata.keywords.indexOf(favTag);
        if (idx >= 0) {
            media.metadata.keywords.splice(idx, 1);
        }
        else {
            media.metadata.keywords.push(favTag);
        }
        await repository.save(media);
    });
};
exports.init = init;
const cleanUp = async (extension) => {
    extension.Logger.debug('Cleaning up favorites extension');
};
exports.cleanUp = cleanUp;
//# sourceMappingURL=server.js.map