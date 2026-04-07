package handlers

import (
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ximilala/cloudflare-manager/internal/services"
)

type KVHandler struct {
	service *services.KVService
}

func NewKVHandler(service *services.KVService) *KVHandler {
	return &KVHandler{service: service}
}

func (h *KVHandler) ListNamespaces(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	namespaces, err := h.service.ListNamespaces(uint(accountID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, namespaces)
}

func (h *KVHandler) CreateNamespace(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	var req services.CreateKVNamespaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ns, err := h.service.CreateNamespace(uint(accountID), req.Title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, ns)
}

func (h *KVHandler) DeleteNamespace(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	nsID := c.Param("namespaceId")
	if err := h.service.DeleteNamespace(uint(accountID), nsID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "namespace deleted"})
}

func (h *KVHandler) ListKeys(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	nsID := c.Param("namespaceId")
	cursor := c.Query("cursor")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	keys, nextCursor, err := h.service.ListKeys(uint(accountID), nsID, cursor, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"keys": keys, "cursor": nextCursor})
}

func (h *KVHandler) GetValue(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	nsID := c.Param("namespaceId")
	key := c.Param("key")

	value, err := h.service.GetValue(uint(accountID), nsID, key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"key": key, "value": string(value)})
}

func (h *KVHandler) PutValue(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	nsID := c.Param("namespaceId")
	key := c.Param("key")

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body"})
		return
	}

	if err := h.service.PutValue(uint(accountID), nsID, key, body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "value stored", "key": key})
}

func (h *KVHandler) DeleteKey(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	nsID := c.Param("namespaceId")
	key := c.Param("key")

	if err := h.service.DeleteKey(uint(accountID), nsID, key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "key deleted"})
}
