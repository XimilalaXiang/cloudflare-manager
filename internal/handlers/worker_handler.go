package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ximilala/cloudflare-manager/internal/services"
)

type WorkerHandler struct {
	service *services.WorkerService
}

func NewWorkerHandler(service *services.WorkerService) *WorkerHandler {
	return &WorkerHandler{service: service}
}

func (h *WorkerHandler) List(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	workers, err := h.service.ListWorkers(uint(accountID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workers)
}

func (h *WorkerHandler) GetCode(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	scriptName := c.Param("scriptName")
	code, err := h.service.GetWorkerCode(uint(accountID), scriptName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"script_name": scriptName, "code": code})
}

func (h *WorkerHandler) Deploy(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	var req services.WorkerDeployRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.DeployWorker(uint(accountID), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "worker deployed successfully", "script_name": req.ScriptName})
}

func (h *WorkerHandler) Delete(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	scriptName := c.Param("scriptName")
	if err := h.service.DeleteWorker(uint(accountID), scriptName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "worker deleted successfully"})
}
