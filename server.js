"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.init = void 0;

const UserDTO_1 = require("./node_modules/pigallery2-extension-kit/lib/common/entities/UserDTO");
const SearchQueryDTO_1 = require("./node_modules/pigallery2-extension-kit/lib/common/entities/SearchQueryDTO");
// Including prod extension packages. You need to prefix them with ./node_modules
// lodash does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const _ = require("./node_modules/lodash");
// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
const typeorm_1 = require("typeorm");
// Using typeorm for ORM
let TestLoggerEntity = class TestLoggerEntity {
};
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.PrimaryGeneratedColumn)({ unsigned: true }),
    __metadata("design:type", Number)
], TestLoggerEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TestLoggerEntity.prototype, "text", void 0);
TestLoggerEntity = __decorate([
    (0, typeorm_1.Entity)()
], TestLoggerEntity);

const init = async (extension) => {
    extension.Logger.debug(`My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`);
    /**
     * (Optional) Adding custom SQL table
     */
    await extension.db.setExtensionTables([TestLoggerEntity]);
    /**
     * (Optional) Using prod package
     */
    extension.Logger.silly('lodash prod package works: ', _.defaults({ 'a': 1 }, { 'a': 3, 'b': 2 }));
    /**
     * (Optional) Implementing lifecycles events with MetadataLoader example
     * */
    extension.events.gallery.MetadataLoader
        .loadPhotoMetadata.before(async (input, event) => {
        extension.Logger.silly('onBefore: processing: ', JSON.stringify(input));
        // The return value of this function will be piped to the next before handler
        // or if no other handler then returned to the app
        return input;
        /*
        * (Optional) It is possible to prevent default run and return with the expected out output of the MetadataLoader.loadPhotoMetadata
        NOTE: if event.stopPropagation = true, MetadataLoader.loadPhotoMetadata.after won't be called.
        event.stopPropagation = true;
        return {
          size: {width: 1, height: 1},
          fileSize: 1,
          creationDate: 0
        } as PhotoMetadata;
        */
    });
    extension.events.gallery.MetadataLoader
        .loadPhotoMetadata.after(async (data) => {
        // Overrides the caption on all photos
        // NOTE: this needs db reset as MetadataLoader only runs during indexing time
        data.output.caption = extension.config.getConfig().myFavouriteNumber + '|PG2 sample extension:' + data.output.caption;
        // The return value of this function will be piped to the next after handler
        // or if no other handler then returned to the app
        return data.output;
    });
    /**
     * (Optional) Adding a REST api endpoint for logged-in users
     */
    extension.RESTApi.get.jsonResponse(['/sample'], UserDTO_1.UserRoles.User, async () => {
        // Inserting into our extension table and returning with the result
        const conn = await extension.db.getSQLConnection();
        conn.getRepository(TestLoggerEntity).save({ text: 'called /sample at: ' + Date.now() });
        return await conn.getRepository(TestLoggerEntity).find();
    });
    /**
     * (Optional) Adding a button to all media elements to be able to delete them
     */
    extension.ui.addMediaButton({
        name: 'delete',
        svgIcon: {
            viewBox: '0 0 448 512',
            items: '<path d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"/></svg>'
        },
        apiPath: 'delete',
        reloadContent: true,
        minUserRole: UserDTO_1.UserRoles.User,
        popup: {
            header: 'Deleting from DB',
            body: '<b>Are you sure?</b>This will delete the photo from the DB only. Next indexing will readd this photo.',
            buttonString: 'Delete',
            customFields: [
                {
                    id: 'confirm',
                    label: 'confirm deletion',
                    type: 'boolean',
                    defaultValue: false,
                    required: true
                }
            ]
        }
    }, async (params, body, user, media, repository) => {
        await repository.delete(media.id);
    });
    /**
     * (Optional) Adding a button to all media elements to be able to edit them
     */
    extension.ui.addMediaButton({
        name: 'edit',
        svgIcon: {
            viewBox: '0 0 512 512',
            items: '<path d="M352.9 21.2L308 66.1 445.9 204 490.8 159.1C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2zM274.1 100L58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L412 237.9 274.1 100z"/></svg>'
        },
        apiPath: 'edit',
        reloadContent: true,
        skipVideos: true,
        popup: {
            header: 'Editing',
            body: 'Are you sure?',
            buttonString: 'Save',
            fields: [
                'title', 'caption', 'cameraData', 'positionData', 'faces', 'keywords', 'size', 'creationDate', 'creationDateOffset',
                'bitRate', 'duration', 'fileSize', 'fps'
            ]
        }
    }, async (params, body, user, media, repository) => {
        // Update media entity with data from the body
        if (body?.data?.fields) {
            // Update fields that are present in the body data
            if (body.data.fields.title !== undefined) {
                media.metadata.title = body.data.fields.title;
            }
            if (body.data.fields.caption !== undefined) {
                media.metadata.caption = body.data.fields.caption;
            }
            if (body.data.fields.cameraData !== undefined) {
                media.metadata.cameraData = JSON.parse(body.data.fields.cameraData);
            }
            if (body.data.fields.positionData !== undefined) {
                media.metadata.positionData = JSON.parse(body.data.fields.positionData);
            }
            if (body.data.fields.faces !== undefined) {
                media.metadata.faces = JSON.parse(body.data.fields.faces);
            }
            if (body.data.fields.keywords !== undefined) {
                media.metadata.keywords = JSON.parse(body.data.fields.keywords);
            }
            if (body.data.fields.size !== undefined) {
                media.metadata.size = JSON.parse(body.data.fields.size);
            }
            if (body.data.fields.creationDate !== undefined) {
                media.metadata.creationDate = parseInt(body.data.fields.creationDate, 10);
            }
            if (body.data.fields.creationDateOffset !== undefined) {
                media.metadata.creationDateOffset = body.data.fields.creationDateOffset;
            }
            if (body.data.fields.fileSize !== undefined) {
                media.metadata.fileSize = parseInt(body.data.fields.fileSize, 10);
            }
            // Save the updated media entity
            await repository.save(media);
            console.log('Media entity updated successfully');
        }
    });
    /**
     * (Optional) Adding a (non-clickable) button to all photos with 4+ stars
     * Note: button order matters, but always visible buttons will be shown first
     */
    extension.ui.addMediaButton({
        name: 'Great Photo',
        svgIcon: {
            viewBox: '0 0 640 640',
            items: '<path d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/></svg>'
        },
        metadataFilter: [{ field: 'rating', comparator: '>=', value: 4 }],
        alwaysVisible: true
    });
    /**
     * (Optional) Adding a button to create a logical album and add photos to it.
     */
    extension.ui.addMediaButton({
        name: 'Add to album',
        svgIcon: {
            viewBox: '0 0 512 512',
            items: '<rect x="64" y="176" width="384" height="256" rx="28.87" ry="28.87" fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M144 80h224M112 128h288"/>'
        },
        minUserRole: UserDTO_1.UserRoles.User,
        apiPath: 'add-album',
        reloadContent: true, 
        popup: {
            header: 'Add to Album',
            body: '<b>Adding photo to the album.</b> This will add an <album name> keyword to the given photo and create an album to show those keywords. On database reset or folder reindexing this info will be lost. Consider saving this keyword next to the photo as a sidecar file or using a second table to store this information.',
            buttonString: 'Add',
            customFields: [
                {
                    id: 'album',
                    label: 'Album name',
                    type: 'string',
                    keepValue: true, 
                    defaultValue: 'Album name',
                    required: true
                }
            ]
        }
    }, async (params, body, user, media, repository) => {
        // Update media entity with data from the body
        if (body?.data?.customFields?.album) {
            // Crate the album keyword
            const albumKey = 'pg-album:' + body.data.customFields.album.toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-') 
                .replace(/^-+|-+$/g, ''); 
            // Save the updated media entity
            media.metadata.keywords = media.metadata.keywords || [];
            media.metadata.keywords.push(albumKey);
            await repository.save(media);
            // create the album if not exists
            await extension._app.objectManagers.AlbumManager.addIfNotExistSavedSearch(body.data.customFields.album, {
                type: SearchQueryDTO_1.SearchQueryTypes.keyword,
                value: albumKey,
                matchType: SearchQueryDTO_1.TextSearchQueryMatchTypes.exact_match
            }, false);
            extension.Logger.debug('Media added to album: ' + body.data.customFields.album + '');
        }
        else {
            extension.Logger.warn('No album name provided');
        }
    });
    // Add a Favorites button
    extension.ui.addMediaButton({
        name: 'favorite',
        svgIcon: {
            viewBox: '0 0 576 512',
            items: '<path fill="currentColor" d="M528.1 171.5L382 150.2 316.7 17c-11.7-23.6-45.6-23.6-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6l130.7 68.7c23.4 12.3 50.9-7.6 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4-124.3-65.4c-9.3-4.9-20.5-4.9-29.8 0L163.7 450.7l23.7-138.4c1.8-10.5-2.6-21.2-11.2-27.2L55.6 210.9l139.8-20.3c10.9-1.6 20.2-8.5 24.9-18.5L288 61.5l68.7 110.6c4.7 10 14 16.9 24.9 18.5l139.8 20.3-122.9 74.2c-8.6 6-13 16.7-11.2 27.2z"/>'
        },
        apiPath: 'toggle-favorite',
        reloadContent: true,
        alwaysVisible: true,
        minUserRole: UserDTO_1.UserRoles.User
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
    /**
     * (Optional) Creating a messenger. You can use it with TopPickJob to send photos
     */
    extension.messengers.addMessenger('SampleMessenger', 
    [{
            id: 'text',
            type: 'string',
            name: 'just a text',
            description: 'nothing to mention here',
            defaultValue: 'I hand picked these photos just for you:',
        }], {
        sendMedia: async (c, m) => {
            console.log('config got:', c.text);
            console.log(m);
        }
    });
};
exports.init = init;
const cleanUp = async (extension) => {
    extension.Logger.debug('Cleaning up');
};
exports.cleanUp = cleanUp;
//# sourceMappingURL=server.js.map
