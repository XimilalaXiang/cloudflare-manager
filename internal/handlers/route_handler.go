package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ximilala/cloudflare-manager/internal/services"
)

type RouteHandler struct {
	service *services.RouteService
}

func NewRouteHandler(service *services.RouteService) *RouteHandler {
	return &RouteHandler{service: service}
}

func (h *RouteHandler) ListRoutes(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	zoneID := c.Param("zoneId")
	routes, err := h.service.ListRoutes(uint(accountID), zoneID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, routes)
}

func (h *RouteHandler) CreateRoute(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	zoneID := c.Param("zoneId")
	var req services.CreateRouteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	route, err := h.service.CreateRoute(uint(accountID), zoneID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, route)
}

func (h *RouteHandler) DeleteRoute(c *gin.Context) {
	accountID, err := strconv.ParseUint(c.Param("accountId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account id"})
		return
	}

	zoneID := c.Param("zoneId")
	routeID := c.Param("routeId")

	if err := h.service.DeleteRoute(uint(accountID), zoneID, routeID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "route deleted"})
}
