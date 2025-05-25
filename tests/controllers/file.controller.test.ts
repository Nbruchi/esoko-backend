import { FileController } from "@/controllers/file.controller";
import { FileService } from "@/services/file.service";
import { Request, Response } from "express";

jest.mock("@/services/file.service");

describe("FileController", () => {
    let fileController: FileController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockFileService: jest.Mocked<FileService>;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockFileService = new FileService() as jest.Mocked<FileService>;
        (FileService as jest.Mock).mockImplementation(() => mockFileService);
        fileController = new FileController();
    });

    describe("uploadFile", () => {
        it("should upload file", async () => {
            const mockFile = { url: "http://test.com/file.jpg" };
            mockFileService.uploadFile.mockResolvedValue(mockFile);
            mockRequest.file = { originalname: "file.jpg" } as any;
            mockRequest.body = { folder: "test-folder" };
            await fileController.uploadFile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockFile);
        });
        it("should handle error", async () => {
            mockFileService.uploadFile.mockRejectedValue(new Error("fail"));
            mockRequest.file = { originalname: "file.jpg" } as any;
            mockRequest.body = { folder: "test-folder" };
            await fileController.uploadFile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteFile", () => {
        it("should delete file", async () => {
            mockFileService.deleteFile.mockResolvedValue(undefined);
            mockRequest.params = { id: "file1" };
            await fileController.deleteFile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "File deleted successfully",
            });
        });
        it("should handle error", async () => {
            mockFileService.deleteFile.mockRejectedValue(new Error("fail"));
            mockRequest.params = { id: "file1" };
            await fileController.deleteFile(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });

    describe("getFileDetails", () => {
        it("should get file details", async () => {
            const mockFile = { url: "http://test.com/file.jpg" };
            mockFileService.getFileDetails.mockResolvedValue(mockFile);
            mockRequest.params = { publicId: "file1" };
            await fileController.getFileDetails(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.json).toHaveBeenCalledWith(mockFile);
        });
        it("should handle error", async () => {
            mockFileService.getFileDetails.mockRejectedValue(new Error("fail"));
            mockRequest.params = { publicId: "file1" };
            await fileController.getFileDetails(
                mockRequest as Request,
                mockResponse as Response
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });
    });
});
