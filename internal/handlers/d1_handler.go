package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ximilala/cloudflare-manager/internal/services"
)

type D1Handler struct {
	service *services.D1Service
}

func NewD1Handler(service *services.D1Service) *D1Handler {
	return &D1Handler{service: service}
}

func (h *D1Handler) ListDatabases(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	dbs, err := h.service.ListDatabases(uint(accountID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, dbs)
}

func (h *D1Handler) CreateDatabase(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	var req services.CreateD1DatabaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db, err := h.service.CreateDatabase(uint(accountID), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, db)
}

func (h *D1Handler) DeleteDatabase(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	dbID := c.Param("databaseId")
	if err := h.service.DeleteDatabase(uint(accountID), dbID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "database deleted"})
}

func (h *D1Handler) Query(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	dbID := c.Param("databaseId")
	var req services.D1QueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.QueryDatabase(uint(accountID), dbID, req.SQL, req.Params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}
