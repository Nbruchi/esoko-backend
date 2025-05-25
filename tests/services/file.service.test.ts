import { FileService, FileCategory } from "@/services/file.service";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Mock cloudinary
jest.mock("cloudinary", () => ({
    v2: {
        uploader: {
            upload_stream: jest.fn(),
            destroy: jest.fn(),
            explicit: jest.fn(),
        },
        api: {
            resource: jest.fn(),
            resources: jest.fn(),
        },
        utils: {
            sign_request: jest.fn(),
        },
    },
}));

describe("FileService", () => {
    let fileService: FileService;
    const mockFile = {
        buffer: Buffer.from("test image"),
        mimetype: "image/jpeg",
        originalname: "test.jpg",
    } as Express.Multer.File;

    const mockCloudinaryResponse = {
        public_id: "test-folder/test",
        secure_url: "https://cloudinary.com/test-folder/test",
        format: "jpg",
        width: 1000,
        height: 1000,
    };

    beforeEach(() => {
        fileService = new FileService();
        jest.clearAllMocks();
    });

    describe("uploadFile", () => {
        it("should upload file successfully", async () => {
            const mockUploadStream = {
                pipe: jest.fn(),
            };
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    callback(null, mockCloudinaryResponse);
                    return mockUploadStream;
                }
            );

            const result = await fileService.uploadFile(
                mockFile,
                "test-folder"
            );

            expect(result).toEqual(mockCloudinaryResponse);
            expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
                expect.objectContaining({
                    folder: "test-folder",
                    resource_type: "auto",
                    transformation: expect.any(Array),
                }),
                expect.any(Function)
            );
        });

        it("should handle upload error", async () => {
            const mockError = new Error("Upload failed");
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    callback(mockError, null);
                    return { pipe: jest.fn() };
                }
            );

            await expect(
                fileService.uploadFile(mockFile, "test-folder")
            ).rejects.toThrow("Upload failed");
        });
    });

    describe("deleteFile", () => {
        it("should delete file successfully", async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: "ok",
            });

            const result = await fileService.deleteFile("test-folder/test");

            expect(result).toEqual({ result: "ok" });
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
                "test-folder/test"
            );
        });

        it("should handle delete error", async () => {
            const mockError = new Error("Delete failed");
            (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
                mockError
            );

            await expect(
                fileService.deleteFile("test-folder/test")
            ).rejects.toThrow("Delete failed");
        });
    });

    describe("uploadWithCategory", () => {
        const categories: FileCategory[] = [
            "profile",
            "product",
            "category",
            "seller",
            "blog",
        ];

        categories.forEach((category) => {
            it(`should upload ${category} with correct transformations`, async () => {
                const mockUploadStream = {
                    pipe: jest.fn(),
                };
                (
                    cloudinary.uploader.upload_stream as jest.Mock
                ).mockImplementation((options, callback) => {
                    callback(null, mockCloudinaryResponse);
                    return mockUploadStream;
                });

                const result = await fileService.uploadWithCategory(
                    mockFile,
                    category,
                    "test-folder"
                );

                expect(result).toEqual(mockCloudinaryResponse);

                // Special handling for product category which has a different transformation structure
                if (category === "product") {
                    expect(
                        cloudinary.uploader.upload_stream
                    ).toHaveBeenCalledWith(
                        expect.objectContaining({
                            folder: "test-folder",
                            resource_type: "auto",
                            transformation: expect.objectContaining({
                                thumbnail: expect.any(Array),
                                listing: expect.any(Array),
                                detail: expect.any(Array),
                            }),
                        }),
                        expect.any(Function)
                    );
                } else {
                    expect(
                        cloudinary.uploader.upload_stream
                    ).toHaveBeenCalledWith(
                        expect.objectContaining({
                            folder: "test-folder",
                            resource_type: "auto",
                            transformation: expect.any(Array),
                        }),
                        expect.any(Function)
                    );
                }
            });
        });

        it("should handle upload error", async () => {
            const mockError = new Error("Upload failed");
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    callback(mockError, null);
                    return { pipe: jest.fn() };
                }
            );

            await expect(
                fileService.uploadWithCategory(
                    mockFile,
                    "profile",
                    "test-folder"
                )
            ).rejects.toThrow("Upload failed");
        });
    });

    describe("updateFile", () => {
        it("should update file successfully", async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: "ok",
            });
            const mockUploadStream = {
                pipe: jest.fn(),
            };
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    callback(null, mockCloudinaryResponse);
                    return mockUploadStream;
                }
            );

            const result = await fileService.updateFile(
                mockFile,
                "old-file-id",
                "test-folder"
            );

            expect(result).toEqual(mockCloudinaryResponse);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
                "old-file-id"
            );
            expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
        });

        it("should handle update error", async () => {
            const mockError = new Error("Update failed");
            (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
                mockError
            );

            await expect(
                fileService.updateFile(mockFile, "old-file-id", "test-folder")
            ).rejects.toThrow("Failed to update file Error: Update failed");
        });
    });

    describe("getUploadMiddleware", () => {
        it("should return multer middleware for category", () => {
            const middleware = fileService.getUploadMiddleware("profile");
            expect(middleware).toBeDefined();
        });
    });
});
